import pytest
from starlette.websockets import WebSocketDisconnect

from .conftest import login, new_traveler

COMPANION_ID = 3


def _token(headers: dict) -> str:
    return headers["Authorization"].split(" ")[1]


def _start_conversation(client, headers, other_id=COMPANION_ID, status=200):
    resp = client.post("/conversations", headers=headers, json={"user_b_id": other_id})
    assert resp.status_code == status, resp.text
    return resp.json()


def test_start_conversation_and_list(client):
    _, headers = new_traveler(client)
    conv = _start_conversation(client, headers)
    assert conv["id"] and conv["other_user"]["id"] == COMPANION_ID
    listing = client.get("/conversations", headers=headers).json()
    assert any(c["id"] == conv["id"] for c in listing)


def test_start_conversation_is_idempotent(client):
    _, headers = new_traveler(client)
    first = _start_conversation(client, headers)
    second = _start_conversation(client, headers)
    assert second["id"] == first["id"]


def test_cannot_message_self(client):
    data, headers = new_traveler(client)
    resp = client.post(
        "/conversations", headers=headers, json={"user_b_id": data["user"]["id"]}
    )
    assert resp.status_code == 400


def test_cannot_read_others_conversation(client):
    _, headers = new_traveler(client)
    _, other_headers = new_traveler(client)
    conv = _start_conversation(client, headers)
    resp = client.get(f"/conversations/{conv['id']}/messages", headers=other_headers)
    assert resp.status_code == 403


def test_message_roundtrip_read_state_and_notifications(client):
    data, t_headers = new_traveler(client)
    t_id = data["user"]["id"]
    c_headers = login(client, "wanjiru.kamau@pamoja.ke")
    conv = _start_conversation(client, t_headers)
    cid = conv["id"]

    sent = client.post(
        f"/conversations/{cid}/messages",
        headers=t_headers,
        json={"body": "Hi Wanjiru, museum at 3?"},
    )
    assert sent.status_code == 200
    assert sent.json()["sender_id"] == t_id
    assert sent.json()["flagged"] is False

    comp_listing = client.get("/conversations", headers=c_headers).json()
    mine = next(c for c in comp_listing if c["id"] == cid)
    assert mine["unread_count"] == 1
    assert mine["last_message"]["body"] == "Hi Wanjiru, museum at 3?"

    inbox = client.get("/notifications?limit=10", headers=c_headers).json()
    assert any(n["title"].startswith("New message from") for n in inbox)

    comp_messages = client.get(f"/conversations/{cid}/messages", headers=c_headers).json()
    assert [m["body"] for m in comp_messages] == ["Hi Wanjiru, museum at 3?"]
    assert comp_messages[0]["read_at"] is not None

    reply = client.post(
        f"/conversations/{cid}/messages",
        headers=c_headers,
        json={"body": "Sure, see you there!"},
    )
    assert reply.status_code == 200

    trav_listing = client.get("/conversations", headers=t_headers).json()
    mine = next(c for c in trav_listing if c["id"] == cid)
    assert mine["unread_count"] == 1
    assert mine["last_message"]["body"] == "Sure, see you there!"

    trav_messages = client.get(f"/conversations/{cid}/messages", headers=t_headers).json()
    assert [m["body"] for m in trav_messages] == ["Hi Wanjiru, museum at 3?", "Sure, see you there!"]
    after = client.get("/conversations", headers=t_headers).json()
    assert next(c for c in after if c["id"] == cid)["unread_count"] == 0


def test_block_after_conversation_blocks_messaging(client):
    _, t_headers = new_traveler(client)
    conv = _start_conversation(client, t_headers)
    client.post("/blocks", headers=t_headers, json={"blocked_id": COMPANION_ID})
    resp = client.post(
        f"/conversations/{conv['id']}/messages",
        headers=t_headers,
        json={"body": "you blocked"},
    )
    assert resp.status_code == 403


def test_websocket_live_chat(client):
    data, t_headers = new_traveler(client)
    c_headers = login(client, "wanjiru.kamau@pamoja.ke")
    conv = _start_conversation(client, t_headers)
    cid = conv["id"]

    with client.websocket_connect(f"/conversations/ws/{cid}?token={_token(t_headers)}") as ws:
        ws.send_json({"body": "hello over ws"})
        echo = ws.receive_json()
        assert echo["body"] == "hello over ws"
        assert echo["sender_id"] == data["user"]["id"]
        assert echo["flagged"] is False

    history = client.get(f"/conversations/{cid}/messages", headers=c_headers).json()
    assert "hello over ws" in [m["body"] for m in history]


def test_websocket_persists_and_censors(client):
    _, t_headers = new_traveler(client)
    c_headers = login(client, "wanjiru.kamau@pamoja.ke")
    conv = _start_conversation(client, t_headers)

    with client.websocket_connect(f"/conversations/ws/{conv['id']}?token={_token(t_headers)}") as ws:
        ws.send_json({"body": "wanna meet for escort stuff"})
        echo = ws.receive_json()
        assert echo["flagged"] is True
        assert "escort" not in echo["body"].lower()


def test_websocket_rejects_bad_token(client):
    _, t_headers = new_traveler(client)
    conv = _start_conversation(client, t_headers)
    with pytest.raises(WebSocketDisconnect):
        with client.websocket_connect(
            f"/conversations/ws/{conv['id']}?token=garbage"
        ) as ws:
            ws.receive_json()

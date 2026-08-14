from sqlalchemy.orm import Session

from .database import SessionLocal
from .models import CompanionProfile, User
from .security import hash_password

COMPANIONS = [
    {
        "name": "Wanjiru Kamau", "gender": "female", "city": "Nairobi",
        "tagline": "Nairobi insider who knows every hidden gem",
        "rate": 1500,
        "bio": "Born and raised in Nairobi. I love showing visitors the real city — from Kibera art tours to rooftop dinners with a view of the skyline. Fluent storyteller, huge coffee nerd.",
        "interests": ["coffee", "art", "history", "photography", "food"],
        "languages": ["English", "Swahili", "Kikuyu"],
        "activities": ["city_tours", "coffee", "museums", "photography", "history"],
        "availability": {"mon": "09:00-17:00", "tue": "09:00-17:00", "wed": "09:00-17:00",
                         "thu": "09:00-17:00", "fri": "09:00-19:00", "sat": "10:00-20:00"},
    },
    {
        "name": "Brian Otieno", "gender": "male", "city": "Nairobi",
        "tagline": "Safari planner, hiking buddy, event plus-one",
        "rate": 1200,
        "bio": "Ex-tour guide with 6 years of experience. I plan walks in Karura Forest, day trips to Amboseli, and can help you navigate matatus like a local. All about good vibes and safe adventures.",
        "interests": ["wildlife", "hiking", "music", "sports", "photography"],
        "languages": ["English", "Swahili", "Dholuo"],
        "activities": ["wildlife", "hiking", "city_tours", "music", "photography"],
        "availability": {"mon": "10:00-18:00", "tue": "10:00-18:00", "wed": "10:00-18:00",
                         "fri": "10:00-20:00", "sat": "08:00-20:00", "sun": "08:00-18:00"},
        "featured": True,
    },
    {
        "name": "Fatuma Hassan", "gender": "female", "city": "Mombasa",
        "tagline": "Swahili culture, old town stories, seafood nights",
        "rate": 1300,
        "bio": "Mombasa girl through and through. I'll walk you through Old Town's winding alleys, show you the best seafood spots locals love, and tell you the history behind the tusks and Fort Jesus.",
        "interests": ["history", "food", "beaches", "shopping", "coffee"],
        "languages": ["English", "Swahili"],
        "activities": ["history", "beaches", "dining", "shopping", "city_tours"],
        "availability": {"tue": "10:00-18:00", "thu": "10:00-18:00", "fri": "10:00-20:00",
                         "sat": "09:00-20:00", "sun": "10:00-18:00"},
    },
    {
        "name": "Samwel Kipchoge", "gender": "male", "city": "Eldoret",
        "tagline": "Rift Valley runner, stadium tours, local legends",
        "rate": 1000,
        "bio": "Eldoret is home of champions and I'm your guide to it. Morning jog at Iten, meet local athletes, visit the cheese farms, and eat like a champion. Friendly, punctual, very fit!",
        "interests": ["sports", "hiking", "food", "music"],
        "languages": ["English", "Swahili", "Kalenjin"],
        "activities": ["city_tours", "hiking", "music"],
        "availability": {"mon": "08:00-16:00", "wed": "08:00-16:00", "thu": "08:00-16:00",
                         "sat": "08:00-18:00", "sun": "10:00-16:00"},
    },
    {
        "name": "Zawadi Mwangi", "gender": "female", "city": "Nakuru",
        "tagline": "Flamingos, waterfalls, and Nakuru's best Nyama Choma",
        "rate": 1100,
        "bio": "I grew up minutes from Lake Nakuru National Park. Let me arrange your flamingo viewing, a walk by Menengai Crater, and a proper nyama choma evening with local friends. Karibu!",
        "interests": ["wildlife", "photography", "food", "hiking"],
        "languages": ["English", "Swahili", "Kikuyu"],
        "activities": ["wildlife", "photography", "dining", "hiking"],
        "availability": {"mon": "09:00-17:00", "tue": "09:00-17:00", "wed": "09:00-17:00",
                         "fri": "09:00-18:00", "sat": "09:00-20:00", "sun": "10:00-18:00"},
    },
    {
        "name": "Amina Yusuf", "gender": "female", "city": "Diani",
        "tagline": "White sands, snorkelling, and sunset dhow rides",
        "rate": 1800,
        "bio": "Diani is paradise and I live in it. Snorkel the marine park, walk the beach at low tide, or just sip coconuts while we talk life. I know every tide table and every great sunset spot.",
        "interests": ["beaches", "wildlife", "photography", "food"],
        "languages": ["English", "Swahili"],
        "activities": ["beaches", "wildlife", "dining", "photography"],
        "availability": {"tue": "09:00-17:00", "thu": "09:00-17:00", "fri": "09:00-18:00",
                         "sat": "09:00-18:00", "sun": "09:00-17:00"},
        "featured": True,
    },
    {
        "name": "Grace Njeri", "gender": "female", "city": "Nyeri",
        "tagline": "Mount Kenya foothills, coffee farms, and green tea",
        "rate": 900,
        "bio": "Up-country girl with a love for quiet beauty. We'll visit coffee estates, hike the foothills of Mount Kenya, and sip tea at a farm overlooking the Aberdares. Peaceful and warm company.",
        "interests": ["hiking", "coffee", "history", "photography"],
        "languages": ["English", "Swahili", "Kikuyu"],
        "activities": ["hiking", "coffee", "history", "city_tours"],
        "availability": {"mon": "09:00-16:00", "tue": "09:00-16:00", "wed": "09:00-16:00",
                         "thu": "09:00-16:00", "fri": "09:00-17:00", "sat": "09:00-18:00"},
    },
    {
        "name": "Achieng Odhiambo", "gender": "female", "city": "Kisumu",
        "tagline": "Lake Victoria sunsets, Dunga fishing village, choma by the shore",
        "rate": 1000,
        "bio": "Kisumu is home. Fish market at Dunga at sunrise, sunset boat rides on Lake Victoria, and the friendliest people in Kenya. I'll also teach you a few words of Dholuo!",
        "interests": ["beaches", "food", "music", "history"],
        "languages": ["English", "Swahili", "Dholuo"],
        "activities": ["beaches", "dining", "music", "history", "city_tours"],
        "availability": {"mon": "10:00-18:00", "tue": "10:00-18:00", "thu": "10:00-18:00",
                         "fri": "10:00-20:00", "sat": "10:00-20:00", "sun": "11:00-18:00"},
    },
    {
        "name": "David Mutai", "gender": "male", "city": "Naivasha",
        "tagline": "Boat rides, crescent island, and giraffe sightings",
        "rate": 1200,
        "bio": "Naivasha's lakes and wildlife are my playground. Kayak at sunrise, walk with giraffes on Crescent Island, enjoy lakeside coffee. Easy-going and safety-first.",
        "interests": ["wildlife", "hiking", "photography", "beaches"],
        "languages": ["English", "Swahili", "Kalenjin"],
        "activities": ["wildlife", "hiking", "photography", "coffee"],
        "availability": {"mon": "08:00-17:00", "wed": "08:00-17:00", "fri": "08:00-18:00",
                         "sat": "08:00-19:00", "sun": "08:00-17:00"},
    },
    {
        "name": "Halima Abdi", "gender": "female", "city": "Malindi",
        "tagline": "Historic Malindi, marine park boat trips, local cuisine",
        "rate": 1000,
        "bio": "From the Gede Ruins to the Vasco da Gama pillar, I'll show you Malindi's centuries of history — then the best fresh seafood at the local market. Warm, chatty, and reliable.",
        "interests": ["history", "beaches", "food", "shopping"],
        "languages": ["English", "Swahili", "Somali"],
        "activities": ["history", "beaches", "dining", "shopping", "city_tours"],
        "availability": {"mon": "09:00-17:00", "tue": "09:00-17:00", "thu": "09:00-17:00",
                         "fri": "09:00-18:00", "sat": "09:00-18:00", "sun": "10:00-17:00"},
    },
    {
        "name": "Kevin Ochieng", "gender": "male", "city": "Nairobi",
        "tagline": "Gaming arcades, bowling, and safe nights out",
        "rate": 800,
        "bio": "Fun, laid-back and always up for an activity. Bowling, arcades, cinema, or a comedy night — I'll keep the vibes light and make sure you have a memorable evening out.",
        "interests": ["video_games", "movies", "music", "sports"],
        "languages": ["English", "Swahili", "Kikuyu"],
        "activities": ["bowling", "video_games", "movies", "comedy", "amusement"],
        "availability": {"mon": "14:00-22:00", "wed": "14:00-22:00", "thu": "14:00-22:00",
                         "fri": "12:00-23:00", "sat": "12:00-23:00", "sun": "14:00-20:00"},
        "featured": True,
    },
    {
        "name": "Mercy Atieno", "gender": "female", "city": "Mombasa",
        "tagline": "Sunset swims, saltwater spa, and beach yoga",
        "rate": 1400,
        "bio": "Wellness lover in Mombasa. Beach yoga at dawn, swim coaching if you want it, and the best smoothie spots in Nyali. Calm energy, great conversation.",
        "interests": ["swimming", "yoga", "beaches", "food"],
        "languages": ["English", "Swahili", "Dholuo"],
        "activities": ["swimming", "yoga", "beaches", "dining", "coffee"],
        "availability": {"tue": "08:00-17:00", "wed": "08:00-17:00", "thu": "08:00-17:00",
                         "sat": "08:00-19:00", "sun": "08:00-17:00"},
    },
    {
        "name": "James Mwangi", "gender": "male", "city": "Nyahururu",
        "tagline": "Thomson's Falls, hiking, and quiet highland trails",
        "rate": 900,
        "bio": "Highlands explorer at heart. Guided walks around Thomson's Falls, Lake Ol' Bolossat birding, and long lunches at local farms. Prefer small groups and slow mornings.",
        "interests": ["hiking", "wildlife", "photography", "history"],
        "languages": ["English", "Swahili", "Kikuyu"],
        "activities": ["hiking", "wildlife", "photography", "picnic"],
        "availability": {"mon": "08:00-16:00", "tue": "08:00-16:00", "thu": "08:00-16:00",
                         "sat": "08:00-18:00", "sun": "09:00-16:00"},
        "verified": True,
    },
]


def seed(db: Session) -> None:
    if db.query(User).count() > 0:
        return

    from .config import settings

    admin = User(
        role="companion", is_admin=True, email=settings.ADMIN_EMAIL,
        password_hash=hash_password(settings.ADMIN_PASSWORD),
        name="Pamoja Admin", is_approved=True,
    )
    db.add(admin)

    traveler = User(
        role="traveler", email="demo@pamoja.ke",
        password_hash=hash_password("password123"),
        name="Demo Traveler", city="Nairobi", gender="male",
        interests=["photography", "food", "hiking"],
        languages=["English"],
        is_approved=True,
    )
    db.add(traveler)

    for c in COMPANIONS:
        user = User(
            role="companion",
            email=c["name"].lower().replace(" ", ".") + "@pamoja.ke",
            password_hash=hash_password("password123"),
            name=c["name"], gender=c["gender"], city=c["city"],
            interests=c["interests"], languages=c["languages"],
            bio=c["bio"], is_approved=True, status="active",
        )
        user.companion_profile = CompanionProfile(
            tagline=c["tagline"], hourly_rate_kes=c["rate"],
            description=c["bio"], activity_types=c["activities"],
            availability=c["availability"], is_featured=c.get("featured", False),
            verified_id=bool(c.get("verified", c.get("featured", False))),
            rating_avg=round(4.2 + (hash(c["name"]) % 8) / 10, 1),
            rating_count=3 + hash(c["name"]) % 40,
        )
        db.add(user)

    db.commit()


def run() -> None:
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()


if __name__ == "__main__":
    run()
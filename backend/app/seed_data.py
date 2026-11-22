from datetime import datetime

INITIAL_SERMONS = [
    {
        "id": "sermon-koodaram-1",
        "title": "கூடார பண்டிகை | Pastor Rajendran | Grace Victory Church | Session 1",
        "speaker": "Pastor P. Rajendran",
        "date": "2026-11-13",
        "series": "கூடாரப் பண்டிகை பெருவிழா",
        "scripture": "லேவியராகமம் 23:33-43",
        "summary": "Grace Victory Church - கூடார பண்டிகை பெருவிழா முதல் நாள் ஆராதனை (Session 1). Pastor P. Rajendran அவர்களின் விசேஷித்த தேவ செய்தி.",
        "video_url": "https://www.youtube.com/live/Z4b_LfCPc_I?si=DIaZm-7InVikYkay",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "duration": "Session 1",
        "category": "கூடாரப் பண்டிகை",
        "language": "Tamil",
        "thumbnail": "https://img.youtube.com/vi/Z4b_LfCPc_I/hqdefault.jpg"
    },
    {
        "id": "sermon-koodaram-2",
        "title": "கூடார பண்டிகை | Pastor Rajendran | Grace Victory Church | Session 2",
        "speaker": "Pastor P. Rajendran",
        "date": "2026-11-14",
        "series": "கூடாரப் பண்டிகை பெருவிழா",
        "scripture": "யோவேல் 2:28-29",
        "summary": "Grace Victory Church - கூடார பண்டிகை பெருவிழா இரண்டாம் நாள் ஆராதனை (Session 2). Pastor P. Rajendran அவர்களின் விசேஷித்த தேவ செய்தி.",
        "video_url": "https://www.youtube.com/live/5lhYi5eM_Yw?si=SM2XuKbbKksV3nuO",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        "duration": "Session 2",
        "category": "கூடாரப் பண்டிகை",
        "language": "Tamil",
        "thumbnail": "https://img.youtube.com/vi/5lhYi5eM_Yw/hqdefault.jpg"
    },
    {
        "id": "sermon-1",
        "title": "Living by Unshakable Faith (அசைக்க முடியாத விசுவாசம்)",
        "speaker": "Pastor P. Rajendran",
        "date": "2026-11-15",
        "series": "Victorious Living Series",
        "scripture": "Hebrews 11:1-6 & 1 John 5:4",
        "summary": "Discover the divine truth of how faith overcomes the world. No matter the storm you face, God's grace gives you the victory.",
        "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "duration": "48 mins",
        "category": "Sunday Worship",
        "language": "Tamil & English",
        "thumbnail": "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "id": "sermon-2",
        "title": "The Power of Grace in Broken Times (கிருபையின் மகத்துவம்)",
        "speaker": "Pastor Rachel Rajendran",
        "date": "2026-11-08",
        "series": "Grace Unveiled",
        "scripture": "2 Corinthians 12:9-10",
        "summary": "When you are weak, His strength is made perfect. Experience how God's abundant grace turns our tears into triumph.",
        "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        "duration": "42 mins",
        "category": "Sunday Worship",
        "language": "Tamil & English",
        "thumbnail": "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "id": "sermon-3",
        "title": "Walking in the Supernatural Anointing (பரிசுத்த ஆவியின் அபிஷேகம்)",
        "speaker": "Pastor P. Rajendran",
        "date": "2026-11-01",
        "series": "Holy Spirit Empowerment",
        "scripture": "Acts 1:8 & Isaiah 10:27",
        "summary": "Learn how the Holy Spirit empowers believers to break yokes, pray with authority, and witness with transformative power.",
        "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        "duration": "52 mins",
        "category": "Revival Night",
        "language": "Tamil",
        "thumbnail": "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "id": "sermon-4",
        "title": "Building Strong Christian Families (குடும்ப ஆசீர்வாதம்)",
        "speaker": "Assoc. Pastor David Sam",
        "date": "2026-10-25",
        "series": "Kingdom Family",
        "scripture": "Joshua 24:15 & Psalm 128",
        "summary": "Practical biblical wisdom for husbands, wives, parents, and youth on cultivating a Christ-centered, loving household.",
        "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        "duration": "40 mins",
        "category": "Family Sunday",
        "language": "Tamil & English",
        "thumbnail": "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80"
    }
]

INITIAL_EVENTS = [
    {
        "id": "event-1",
        "title": "Sunday Celebration Services (ஞாயிறு ஆராதனை)",
        "description": "Join us for spirit-filled worship, communion, uplifting fellowship, and anointed preaching of God's Word.",
        "date": "Every Sunday",
        "time": "Every Sunday: 09:30 AM – 11:30 AM",
        "location": "Grace Victory Church Main Sanctuary, Victory Hall",
        "category": "Sunday Worship",
        "image_url": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
        "featured": True,
        "registration_required": False,
        "extra_info": "Fellowship Refreshments & Warm Tea served after service (அன்பு விருந்து)",
        "highlights": [
            "Anointed Praise & Intercession",
            "Communion & Pastoral Blessing",
            "Free Entry • All Are Cordially Welcome"
        ]
    },
    {
        "id": "event-2",
        "title": "Annual Miracle & Revival Conference 2026",
        "description": "3 Days of extraordinary power, healing, prophetic insight, and praise with guest worship ministers and speakers.",
        "date": "December 18 - 20, 2026",
        "time": "6:30 PM - 9:30 PM Daily",
        "location": "GVC Convention Grounds & Online Live Stream",
        "category": "Conference",
        "image_url": "https://images.unsplash.com/photo-1508997449629-303059a039c0?auto=format&fit=crop&w=1200&q=80",
        "featured": True,
        "registration_required": False,
        "extra_info": "Special Fellowship Dinner provided on all 3 evenings (அனைவருக்கும் உணவு ஏற்பாடு செய்யப்பட்டுள்ளது)",
        "highlights": [
            "Guest Prophetic Ministers & Anointed Praise",
            "Fellowship Dinner (அன்பு விருந்து) Provided",
            "Healing & Deliverance Anointing"
        ]
    },
    {
        "id": "event-3",
        "title": "Ignite Youth Camp: 'Set Apart'",
        "description": "A dynamic 2-day youth retreat with powerful worship, sports, outdoor activities, team challenges, and life coaching.",
        "date": "November 28 - 29, 2026",
        "time": "Starting Friday 4:00 PM",
        "location": "Grace Hill Retreat Center",
        "category": "Youth",
        "image_url": "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80",
        "featured": False,
        "registration_required": False,
        "extra_info": "Full Accommodation & Meals (Breakfast, Lunch, Dinner) included",
        "highlights": [
            "Youth Revival, Live Band & Campfire",
            "Full Board Meals & Refreshments Provided",
            "Free Bus Transportation from Church"
        ]
    },
    {
        "id": "event-4",
        "title": "All-Night Prayer Vigil (முழு இரவு ஜெபம்)",
        "description": "Interceding for our families, church, city, nation, and spiritual revival. Come seek God's face through the watches of the night.",
        "date": "First Friday of Every Month",
        "time": "10:00 PM - 05:00 AM",
        "location": "Prayer Chapel, Grace Victory Church",
        "category": "Prayer",
        "image_url": "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=80",
        "featured": False,
        "registration_required": False,
        "extra_info": "Midnight Tea & Morning Coffee with snacks served for all intercessors",
        "highlights": [
            "Breakthrough Intercession & Warfare Prayer",
            "Midnight Tea & Morning Breakfast Provided",
            "Individual Laying on of Hands & Blessing"
        ]
    }
]

INITIAL_PRAYERS = [
    {
        "id": "prayer-1",
        "name": "Sister Sarah & Family",
        "request": "Please pray for complete healing and restoration for my father who recently underwent surgery. Believing God for supernatural recovery.",
        "category": "Healing",
        "is_public": True,
        "is_anonymous": False,
        "prayer_count": 48,
        "created_at": datetime.now()
    },
    {
        "id": "prayer-2",
        "name": "Brother Samuel",
        "request": "Praying for God's divine open doors for a new job opportunity and wisdom in making important career decisions for my family.",
        "category": "Career & Finances",
        "is_public": True,
        "is_anonymous": False,
        "prayer_count": 32,
        "created_at": datetime.now()
    },
    {
        "id": "prayer-3",
        "name": "Anonymous Intercessor",
        "request": "Prayer for spiritual renewal, salvation of loved ones, and peace in our home. Asking God for peace that surpasses all understanding.",
        "category": "Family & Salvation",
        "is_public": True,
        "is_anonymous": True,
        "prayer_count": 65,
        "created_at": datetime.now()
    }
]

INITIAL_TESTIMONIES = [
    {
        "id": "testimony-1",
        "name": "Dr. Arun Kumar & Dr. Priya",
        "story": "When my father was hospitalized in ICU with severe complications, the pastoral team and prayer chain of Grace Victory Church interceded continuously. God performed a supernatural miracle! Today he is completely healed. Praise the Lord!",
        "type": "Miraculous Healing",
        "date": "2026-11-10",
        "location": "Vattamalai",
        "featured_home": True,
        "is_active": True,
        "created_at": datetime.now()
    },
    {
        "id": "testimony-2",
        "name": "Grace Shalini",
        "story": "I came to GVC feeling broken and depressed after failing key exams and losing hope. Through the anointed worship and loving community at Ignite Youth, Jesus healed my mind and restored my confidence. I now work at a top firm and lead a life group!",
        "type": "Life Transformation",
        "date": "2026-11-05",
        "location": "Vattamalai",
        "featured_home": True,
        "is_active": True,
        "created_at": datetime.now()
    },
    {
        "id": "testimony-3",
        "name": "Brother David & Family",
        "story": "Our family business was facing severe financial ruin. Pastor P. Rajendran prayed over us during the Sunday service and prophesied divine breakthrough. Within two months, God opened extraordinary new doors beyond our imagination!",
        "type": "Financial Breakthrough",
        "date": "2026-10-28",
        "location": "Vattamalai",
        "featured_home": True,
        "is_active": True,
        "created_at": datetime.now()
    }
]

INITIAL_MINISTRIES = [
    {
        "id": "ministry-fasting-prayer",
        "title": "Friday Miracle & Fasting Prayer (வெள்ளி உபவாச ஜெபம்)",
        "category": "Fasting Prayer",
        "badge": "Every Friday",
        "tagline": "Breakthroughs for the sick, family burdens, and city revival.",
        "desc": "Intensive corporate intercession, fasting, and laying on of hands for divine healing, deliverance from spiritual bondages, financial breakthroughs, and supernatural open doors.",
        "meeting_time": "Every Friday 10:30 AM – 01:30 PM (Main Chapel)",
        "leader": "Pastor P. Rajendran & Prayer Warriors",
        "image": "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "ministry-intercession-prayer",
        "title": "Wednesday Intercessory & Bible Exposition (புதன் விசேஷித்த உபதேச ஜெபம்)",
        "category": "Intercession",
        "badge": "Mid-Week Service",
        "tagline": "Verse-by-verse scriptural exposition and corporate prayer.",
        "desc": "A deep mid-week gathering dedicated to studying the Word of God verse-by-verse, combined with targeted intercession for church families, children, nations, and revival.",
        "meeting_time": "Every Wednesday 07:00 PM – 08:30 PM",
        "leader": "Pastor R. Franklin Rajendran & Elders",
        "image": "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "ministry-sunday-worship",
        "title": "Sunday Celebratory Worship Service (ஞாயிறு ஆராதனை)",
        "category": "Sunday Worship",
        "badge": "All Believers",
        "tagline": "High-praise, holy communion, and transformative apostolic preaching.",
        "desc": "Our multi-generational family gathering filled with high-energy Tamil and English praise, holy communion, corporate thanksgiving, and prophetic preaching by Pastor P. Rajendran.",
        "meeting_time": "Every Sunday 09:30 AM – 11:30 AM",
        "leader": "Pastor P. Rajendran & Worship Team",
        "image": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "ministry-kids",
        "title": "GVC Champions (Kids Church)",
        "category": "Kids",
        "badge": "Ages 3 – 12",
        "tagline": "Building a rock-solid foundation of faith in young hearts.",
        "desc": "Through engaging Bible storytelling, joyful worship songs, creative crafts, and memory verses, children learn how deeply God loves them.",
        "meeting_time": "Every Sunday 10:15 AM – 12:00 PM (Hall 2)",
        "leader": "Sister Hannah & Champions Team",
        "image": "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "ministry-youth",
        "title": "Ignite Youth Movement",
        "category": "Youth",
        "badge": "Teens & Young Adults",
        "tagline": "Igniting hearts for Jesus with purpose and holy passion.",
        "desc": "A safe, vibrant space where students and young professionals encounter God, forge lifelong friendships, and navigate life's real questions through God's Word.",
        "meeting_time": "Every Saturday 06:00 PM – 08:00 PM",
        "leader": "Pastor R. Franklin Rajendran",
        "image": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "ministry-women",
        "title": "Grace Women of Worth (GWOW)",
        "category": "Women",
        "badge": "All Women & Mothers",
        "tagline": "Empowering women to walk in dignity, prayer, and purpose.",
        "desc": "Monthly tea fellowships, intensive prayer gatherings, and mentorship for young wives and mothers to flourish in their divine calling.",
        "meeting_time": "2nd Saturday of Every Month, 10:00 AM",
        "leader": "Pastor Joice Rajendran",
        "image": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "ministry-men",
        "title": "Men of Honor & Faith",
        "category": "Men",
        "badge": "All Men & Fathers",
        "tagline": "Raising godly leaders for our homes, church, and society.",
        "desc": "Monthly breakfast fellowship, Bible study, and brotherhood accountability to strengthen men in spiritual integrity and leadership.",
        "meeting_time": "3rd Saturday of Every Month, 07:30 AM",
        "leader": "Elder Daniel Victor",
        "image": "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "ministry-worship",
        "title": "GVC Worship & Creative Media",
        "category": "Worship & Media",
        "badge": "Musicians & Tech",
        "tagline": "Ushering in heaven's atmosphere with musical excellence.",
        "desc": "Anointed musicians, sound engineers, camera operators, and designers dedicated to creating an atmosphere where hearts meet God.",
        "meeting_time": "Thursday Rehearsal 07:00 PM",
        "leader": "Blessy Sharon & Creative Collective",
        "image": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "ministry-missions",
        "title": "Grace Community Outreach & Compassion",
        "category": "Outreach",
        "badge": "All Believers",
        "tagline": "Bringing the love and compassionate hands of Christ to the needy.",
        "desc": "Conducting free medical camps, widow assistance, orphan aid, food relief, and hospital visitation across Vattamalai and surrounding villages.",
        "meeting_time": "Monthly Scheduled Outreaches",
        "leader": "Missionary & Compassion Team",
        "image": "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80"
    }
]


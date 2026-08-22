const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");
const { City, Activity } = require("./models");

const citiesData = [
  // --- INDIA ---
  {
    name: "Ahmedabad",
    country: "India",
    countryCode: "IN",
    region: "Asia",
    description: "India's first UNESCO World Heritage City, famous for textile heritage, serene ashrams, and intricate stepwells.",
    image: "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 23.0225, lng: 72.5714 },
    costIndex: 2,
    popularity: 82,
  },
  {
    name: "Mumbai",
    country: "India",
    countryCode: "IN",
    region: "Asia",
    description: "The bustling financial capital of India, home to Bollywood, coastal promenades, colonial architecture, and street food.",
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 18.922, lng: 72.8347 },
    costIndex: 4,
    popularity: 95,
  },
  {
    name: "Delhi",
    country: "India",
    countryCode: "IN",
    region: "Asia",
    description: "India's historic capital blending ancient monuments, Mughal gardens, vibrant bazaars, and modern metropolis life.",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 28.6139, lng: 77.209 },
    costIndex: 3,
    popularity: 94,
  },
  {
    name: "Jaipur",
    country: "India",
    countryCode: "IN",
    region: "Asia",
    description: "The Pink City of Rajasthan, famous for royal palaces, hilltop forts, vibrant textiles, and rich Rajasthani heritage.",
    image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 26.9124, lng: 75.7873 },
    costIndex: 3,
    popularity: 90,
  },
  {
    name: "Udaipur",
    country: "India",
    countryCode: "IN",
    region: "Asia",
    description: "The City of Lakes, known for marble palaces floating on serene waters, romantic sunsets, and royal heritage.",
    image: "https://images.unsplash.com/photo-1615836245337-f5b9b2303f1c?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 24.5854, lng: 73.7125 },
    costIndex: 3,
    popularity: 88,
  },
  {
    name: "Goa",
    country: "India",
    countryCode: "IN",
    region: "Asia",
    description: "India's beach paradise offering golden sands, Portuguese colonial heritage, spice plantations, and nightlife.",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 15.2993, lng: 74.124 },
    costIndex: 3,
    popularity: 96,
  },
  {
    name: "Bengaluru",
    country: "India",
    countryCode: "IN",
    region: "Asia",
    description: "India's Silicon Valley, celebrated for its pleasant climate, lush botanical gardens, craft microbreweries, and tech culture.",
    image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 12.9716, lng: 77.5946 },
    costIndex: 3,
    popularity: 85,
  },
  {
    name: "Hyderabad",
    country: "India",
    countryCode: "IN",
    region: "Asia",
    description: "The City of Pearls, renowned for Charminar, Nizami culinary traditions, world-famous biryani, and tech hubs.",
    image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 17.385, lng: 78.4867 },
    costIndex: 2,
    popularity: 84,
  },
  {
    name: "Kolkata",
    country: "India",
    countryCode: "IN",
    region: "Asia",
    description: "The City of Joy, cultural heartland of India known for colonial grand architectural landmarks, literature, and sweets.",
    image: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 22.5726, lng: 88.3639 },
    costIndex: 2,
    popularity: 83,
  },
  {
    name: "Chennai",
    country: "India",
    countryCode: "IN",
    region: "Asia",
    description: "Gateway to South India, home to ancient Dravidian temples, Marina Beach, classical Carnatic music, and filter coffee.",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 13.0827, lng: 80.2707 },
    costIndex: 2,
    popularity: 80,
  },
  {
    name: "Agra",
    country: "India",
    countryCode: "IN",
    region: "Asia",
    description: "Home of the world wonder Taj Mahal, Agra Fort, and rich Mughal imperial monuments along the Yamuna river.",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 27.1767, lng: 78.0081 },
    costIndex: 2,
    popularity: 98,
  },
  {
    name: "Varanasi",
    country: "India",
    countryCode: "IN",
    region: "Asia",
    description: "One of the oldest continuously inhabited cities in the world, spiritual heart of Hinduism along the sacred River Ganges.",
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 25.3176, lng: 82.9739 },
    costIndex: 2,
    popularity: 91,
  },

  // --- INTERNATIONAL ---
  {
    name: "Dubai",
    country: "United Arab Emirates",
    countryCode: "AE",
    region: "Middle East",
    description: "Futuristic desert metropolis famous for ultra-modern skyscrapers, luxury shopping, artificial islands, and desert safaris.",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 25.2048, lng: 55.2708 },
    costIndex: 5,
    popularity: 97,
  },
  {
    name: "Singapore",
    country: "Singapore",
    countryCode: "SG",
    region: "Asia",
    description: "Global garden city state featuring futuristic Gardens by the Bay, diverse street food hawker centers, and Marina Bay Sands.",
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 1.3521, lng: 103.8198 },
    costIndex: 5,
    popularity: 95,
  },
  {
    name: "Bangkok",
    country: "Thailand",
    countryCode: "TH",
    region: "Asia",
    description: "Vibrant capital of Thailand famous for ornate shrines, bustling boat-filled canals, street food, and lively night markets.",
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 13.7563, lng: 100.5018 },
    costIndex: 3,
    popularity: 96,
  },
  {
    name: "Paris",
    country: "France",
    countryCode: "FR",
    region: "Europe",
    description: "The global center of art, fashion, gastronomy, and culture, famed for the Eiffel Tower, Louvre, and Haussmann avenues.",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 48.8566, lng: 2.3522 },
    costIndex: 5,
    popularity: 99,
  },
  {
    name: "London",
    country: "United Kingdom",
    countryCode: "GB",
    region: "Europe",
    description: "Historic global capital boasting Big Ben, Tower Bridge, West End theater district, world-class museums, and royal parks.",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 51.5074, lng: -0.1278 },
    costIndex: 5,
    popularity: 98,
  },
  {
    name: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    region: "Asia",
    description: "A breathtaking blend of ultra-modern neon skyscrapers, anime pop culture, ancient Shinto shrines, and Michelin gastronomy.",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 35.6762, lng: 139.6503 },
    costIndex: 4,
    popularity: 97,
  },
  {
    name: "Rome",
    country: "Italy",
    countryCode: "IT",
    region: "Europe",
    description: "The Eternal City, steeped in nearly 3,000 years of globally influential art, architecture, Colosseum ruins, and pasta.",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 41.9028, lng: 12.4964 },
    costIndex: 4,
    popularity: 96,
  },
  {
    name: "Bali",
    country: "Indonesia",
    countryCode: "ID",
    region: "Asia",
    description: "Tropical island famous for volcanic mountains, iconic rice paddies, Hindu cliffside temples, and coral reefs.",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: -8.4095, lng: 115.1889 },
    costIndex: 3,
    popularity: 98,
  },
];

const activitiesMap = {
  Ahmedabad: [
    {
      name: "Sabarmati Ashram Visit",
      description: "Historic serene headquarters of Mahatma Gandhi located on the banks of the Sabarmati River.",
      type: "culture",
      duration: 90,
      estimatedCost: 0,
      image: "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Adalaj Stepwell Heritage Tour",
      description: "Magnificent 15th-century five-story Solanki style carved sandstone stepwell.",
      type: "sightseeing",
      duration: 60,
      estimatedCost: 1,
      image: "https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Manek Chowk Street Food Feast",
      description: "Famous old city square transforming into a midnight street food hub with famous Gwalior Dosa and Chocolate Cheese Sandwiches.",
      type: "food",
      duration: 75,
      estimatedCost: 8,
      image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    },
  ],
  Mumbai: [
    {
      name: "Gateway of India & Harbour View",
      description: "Iconic 26-meter basalt arch overlooking the Arabian Sea built to commemorate the 1911 royal visit.",
      type: "sightseeing",
      duration: 60,
      estimatedCost: 0,
      image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Marine Drive Sunset Promenade Walk",
      description: "3.6-kilometer long C-shaped boulevard also known as the Queen's Necklace.",
      type: "relaxation",
      duration: 90,
      estimatedCost: 0,
      image: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Colaba Causeway Street Shopping",
      description: "Bustling street marketplace selling vintage artifacts, jewelry, clothes, and antique souvenirs.",
      type: "shopping",
      duration: 120,
      estimatedCost: 15,
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Elephanta Caves Island Boat Tour",
      description: "UNESCO World Heritage rock-cut cave temples dedicated to Shiva on Elephanta Island.",
      type: "culture",
      duration: 240,
      estimatedCost: 10,
      image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80",
    },
  ],
  Delhi: [
    {
      name: "Red Fort Historical Tour",
      description: "Massive 17th-century red sandstone fortress of Mughal Emperors in Old Delhi.",
      type: "culture",
      duration: 120,
      estimatedCost: 8,
      image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "India Gate & Kartavya Path Stroll",
      description: "WWI war memorial archway standing 42 meters high amidst manicured lawns.",
      type: "sightseeing",
      duration: 60,
      estimatedCost: 0,
      image: "https://images.unsplash.com/photo-1597040663452-f4d0d0eb3745?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Qutub Minar Complex Visit",
      description: "73-meter tall red sandstone victory minaret, a UNESCO World Heritage Site.",
      type: "sightseeing",
      duration: 90,
      estimatedCost: 7,
      image: "https://images.unsplash.com/photo-1608930561578-83ec0bf72f09?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Chandni Chowk Rickshaw & Food Trail",
      description: "Immersive sensory walk through Old Delhi narrow lanes sampling Paranthewali Gali and Jalebi Wala.",
      type: "food",
      duration: 120,
      estimatedCost: 12,
      image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    },
  ],
  Jaipur: [
    {
      name: "Amber Fort Elephant & Jeep Tour",
      description: "Majestic hilltop fort featuring Sheesh Mahal mirror palace overlooking Maota Lake.",
      type: "sightseeing",
      duration: 180,
      estimatedCost: 10,
      image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Hawa Mahal Palace of Winds Walk",
      description: "Iconic 5-story pink honeycomb facade featuring 953 small windows designed for royal women.",
      type: "culture",
      duration: 60,
      estimatedCost: 5,
      image: "https://images.unsplash.com/photo-1602643163983-ed0babc39797?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "City Palace Museum Tour",
      description: "Royal residence complex containing Chandra Mahal, Mubarak Mahal, and exquisite courtyards.",
      type: "culture",
      duration: 120,
      estimatedCost: 12,
      image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=80",
    },
  ],
  Dubai: [
    {
      name: "Burj Khalifa At The Top Observation Deck",
      description: "Ride the world's fastest elevator to 124th floor of the world's tallest building.",
      type: "sightseeing",
      duration: 120,
      estimatedCost: 45,
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Desert Safari & Dune Bashing",
      description: "4x4 sand dune bashing, camel riding, quad biking, and BBQ dinner under starlit desert sky.",
      type: "adventure",
      duration: 360,
      estimatedCost: 60,
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Dubai Fountain & Mall Experience",
      description: "Spectacular choreographed water fountain show set to music right outside Dubai Mall.",
      type: "relaxation",
      duration: 90,
      estimatedCost: 0,
      image: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80",
    },
  ],
  Paris: [
    {
      name: "Eiffel Tower Summit Ascent",
      description: "Ascend to top of the Iron Lady for panoramic views across Paris and the Seine river.",
      type: "sightseeing",
      duration: 150,
      estimatedCost: 30,
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Louvre Museum Highlights Guided Tour",
      description: "See the Mona Lisa, Venus de Milo, and Winged Victory in the world's largest art museum.",
      type: "culture",
      duration: 180,
      estimatedCost: 22,
      image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Seine River Sunset Cruise",
      description: "Relaxing boat cruise along the Seine past Notre-Dame, Musée d'Orsay, and illuminated bridges.",
      type: "relaxation",
      duration: 75,
      estimatedCost: 18,
      image: "https://images.unsplash.com/photo-1509299349698-ab22323ae696?auto=format&fit=crop&w=800&q=80",
    },
  ],
  Tokyo: [
    {
      name: "Senso-ji Temple & Asakusa Market Walk",
      description: "Tokyo's oldest Buddhist temple featuring Nakamise-dori traditional souvenir street.",
      type: "culture",
      duration: 120,
      estimatedCost: 0,
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Shibuya Crossing & Sky Observatory",
      description: "Experience the world's busiest pedestrian intersection followed by 360 rooftop views.",
      type: "sightseeing",
      duration: 90,
      estimatedCost: 18,
      image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
    },
  ],
  Bali: [
    {
      name: "Ubud Monkey Forest & Rice Terrace Trek",
      description: "Explore lush sacred sanctuary with 1000+ macaques followed by Tegallalang rice paddies.",
      type: "nature",
      duration: 240,
      estimatedCost: 12,
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Uluwatu Temple Sunset & Kecak Dance",
      description: "Cliffside temple perched 70 meters above sea featuring traditional fire dance performance.",
      type: "culture",
      duration: 180,
      estimatedCost: 15,
      image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80",
    },
  ],
  Singapore: [
    {
      name: "Gardens by the Bay & Supertree Grove",
      description: "Futuristic botanical park featuring 50m tall Supertrees and Cloud Forest dome.",
      type: "sightseeing",
      duration: 180,
      estimatedCost: 25,
      image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80",
    },
  ],
  London: [
    {
      name: "Tower Bridge & Tower of London",
      description: "Explore Britain's iconic Victorian suspension bridge and Crown Jewels fortress.",
      type: "culture",
      duration: 180,
      estimatedCost: 35,
      image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
    },
  ],
  Rome: [
    {
      name: "Colosseum & Roman Forum Tour",
      description: "Walk inside the world's largest ancient amphitheater where gladiators fought.",
      type: "culture",
      duration: 180,
      estimatedCost: 28,
      image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80",
    },
  ],
  Agra: [
    {
      name: "Taj Mahal Sunrise Guided Tour",
      description: "Experience the glowing marble monument to love at dawn without crowds.",
      type: "sightseeing",
      duration: 180,
      estimatedCost: 15,
      image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
    },
  ],
  Varanasi: [
    {
      name: "Ganges River Sunrise Boat Ride & Ganga Aarti",
      description: "Sacred boat ride along ghats followed by evening oil lamp ritual at Dashashwamedh.",
      type: "culture",
      duration: 120,
      estimatedCost: 5,
      image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
    },
  ],
};

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log("[Seed] Starting MongoDB city & activity seed process...");

    let seededCitiesCount = 0;
    let seededActivitiesCount = 0;

    for (const cityInfo of citiesData) {
      const cityDoc = await City.findOneAndUpdate(
        { name: cityInfo.name, country: cityInfo.country },
        cityInfo,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      seededCitiesCount++;

      const activitiesList = activitiesMap[cityInfo.name] || [];
      for (const actInfo of activitiesList) {
        await Activity.findOneAndUpdate(
          { name: actInfo.name, city: cityDoc._id },
          { ...actInfo, city: cityDoc._id },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        seededActivitiesCount++;
      }
    }

    console.log(`[Seed Complete] Successfully seeded ${seededCitiesCount} Cities and ${seededActivitiesCount} Activities!`);
    process.exit(0);
  } catch (error) {
    console.error("[Seed Error]", error);
    process.exit(1);
  }
};

seedDatabase();

/**
 * STACKLY — RESTAURANT TABLE BOOKING PLATFORM
 * Core Data Store & LocalStorage Synchronizer (js/restaurant-data.js)
 */

const StacklyData = (() => {
  // Initial Seed Restaurants
  const INITIAL_RESTAURANTS = [
    {
      id: "REST-001",
      name: "The Olive Table",
      cuisine: "Contemporary European",
      category: "Fine Dining",
      location: "Anna Nagar, Chennai",
      city: "Chennai",
      address: "14, 2nd Avenue, Anna Nagar, Chennai, Tamil Nadu 600040",
      rating: 4.8,
      reviewsCount: 2420,
      pricePerson: 1200,
      priceTag: "₹₹₹",
      hours: "12:00 PM – 11:30 PM",
      image: "assets/images/featured-olive-table.webp",
      timeSlots: ["7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM"],
      featured: true,
      popular: true,
      occasion: ["Romantic Dinners", "Special Celebrations", "Business Dining"],
      description: "Artfully crafted European dishes featuring Mediterranean herbs, house-made pastas, and wood-fired artisanal specialties in a sun-drenched modern dining room."
    },
    {
      id: "REST-002",
      name: "Spice Garden",
      cuisine: "South Indian",
      category: "Indian",
      location: "T. Nagar, Chennai",
      city: "Chennai",
      address: "88, Usman Road, T. Nagar, Chennai, Tamil Nadu 600017",
      rating: 4.7,
      reviewsCount: 1840,
      pricePerson: 650,
      priceTag: "₹₹",
      hours: "11:30 AM – 10:45 PM",
      image: "assets/images/south-indian-cuisine.webp",
      timeSlots: ["12:30 PM", "1:15 PM", "7:30 PM", "8:00 PM", "8:45 PM"],
      featured: true,
      popular: true,
      occasion: ["Family Gatherings", "Casual Dining"],
      description: "Celebrating heritage recipes from Tamil Nadu, Kerala, and Chettinad, with fragrant rice preparations, heritage dosas, and slow-cooked coastal curries."
    },
    {
      id: "REST-003",
      name: "Sakura House",
      cuisine: "Japanese",
      category: "Japanese",
      location: "Indiranagar, Bengaluru",
      city: "Bengaluru",
      address: "100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038",
      rating: 4.9,
      reviewsCount: 3100,
      pricePerson: 1500,
      priceTag: "₹₹₹₹",
      hours: "1:00 PM – 11:00 PM",
      image: "assets/images/japanese-restaurant.webp",
      timeSlots: ["6:45 PM", "7:30 PM", "8:15 PM", "9:00 PM"],
      featured: true,
      popular: true,
      occasion: ["Romantic Dinners", "Chef's Table", "Special Celebrations"],
      description: "An authentic Tokyo omakase and sushi experience with imported Japanese ingredients, delicate robata skewers, and hand-rolled maki."
    },
    {
      id: "REST-004",
      name: "Terrace & Thyme",
      cuisine: "Modern Fusion",
      category: "Rooftop Dining",
      location: "Race Course, Coimbatore",
      city: "Coimbatore",
      address: "42, Race Course Road, Coimbatore, Tamil Nadu 641018",
      rating: 4.6,
      reviewsCount: 1420,
      pricePerson: 950,
      priceTag: "₹₹₹",
      hours: "5:00 PM – 11:30 PM",
      image: "assets/images/terrace-thyme.webp",
      timeSlots: ["7:00 PM", "7:45 PM", "8:30 PM", "9:15 PM"],
      featured: true,
      popular: true,
      occasion: ["Birthday Celebrations", "Rooftop Dining", "Casual Dining"],
      description: "Lush botanical rooftop lounge offering progressive pan-continental tapas, handcrafted mocktails, and panoramic sunset views over the Nilgiri foothills."
    },
    {
      id: "REST-005",
      name: "Skyline Kitchen",
      cuisine: "Continental & Fusion",
      category: "Rooftop Dining",
      location: "Nungambakkam, Chennai",
      city: "Chennai",
      address: "Khader Nawaz Khan Road, Nungambakkam, Chennai 600006",
      rating: 4.8,
      reviewsCount: 1980,
      pricePerson: 1400,
      priceTag: "₹₹₹",
      hours: "6:00 PM – Midnight",
      image: "assets/images/skyline-kitchen.webp",
      timeSlots: ["7:15 PM", "8:00 PM", "8:45 PM", "9:30 PM"],
      featured: true,
      popular: true,
      occasion: ["Romantic Dinners", "Celebrations", "Business Dining"],
      description: "Elevated dining 15 floors above the city with candlelit tables, grilled signatures, and an intimate skyline backdrop."
    },
    {
      id: "REST-006",
      name: "The Curry House",
      cuisine: "North Indian & Mughlai",
      category: "Indian",
      location: "Velachery, Chennai",
      city: "Chennai",
      address: "100 Feet Bypass Road, Velachery, Chennai 600042",
      rating: 4.5,
      reviewsCount: 1650,
      pricePerson: 800,
      priceTag: "₹₹",
      hours: "12:00 PM – 11:00 PM",
      image: "assets/images/curry-house.webp",
      timeSlots: ["1:00 PM", "1:45 PM", "7:30 PM", "8:15 PM", "9:00 PM"],
      featured: true,
      popular: true,
      occasion: ["Family Gatherings", "Birthday Celebrations"],
      description: "Rich Awadhi biryanis, slow-simmered black dal, tender clay-oven kebabs, and warm tandoori breads served in royal brass tableware."
    },
    {
      id: "REST-007",
      name: "Seaside Resto",
      cuisine: "Coastal & Seafood",
      category: "Seafood",
      location: "ECR, Chennai",
      city: "Chennai",
      address: "East Coast Road, Palavakkam, Chennai 600041",
      rating: 4.8,
      reviewsCount: 2210,
      pricePerson: 1350,
      priceTag: "₹₹₹",
      hours: "12:30 PM – 11:00 PM",
      image: "assets/images/seaside-resto.webp",
      timeSlots: ["1:15 PM", "7:00 PM", "7:45 PM", "8:30 PM", "9:15 PM"],
      featured: true,
      popular: true,
      occasion: ["Family Gatherings", "Romantic Dinners", "Weekend Feasts"],
      description: "Fresh catch of the day from the Coromandel coast, grilled tiger prawns, Mangalorean fish curry, and sea breezes right by the waves."
    },
    {
      id: "REST-008",
      name: "Bella Cucina",
      cuisine: "Italian Classics",
      category: "Italian",
      location: "Koramangala, Bengaluru",
      city: "Bengaluru",
      address: "5th Block, Koramangala, Bengaluru 560095",
      rating: 4.7,
      reviewsCount: 1750,
      pricePerson: 1100,
      priceTag: "₹₹₹",
      hours: "12:00 PM – 11:00 PM",
      image: "assets/images/italian-classics.webp",
      timeSlots: ["1:00 PM", "7:15 PM", "8:00 PM", "8:45 PM"],
      featured: false,
      popular: true,
      occasion: ["Romantic Dinners", "Casual Dining"],
      description: "Neapolitan thin-crust pizzas baked at 450°C, hand-spun tagliatelle with truffles, and rich tiramisu prepared to classic Italian recipes."
    },
    {
      id: "REST-009",
      name: "Dragon & Lotus",
      cuisine: "Asian Fusion",
      category: "Asian Fusion",
      location: "RS Puram, Coimbatore",
      city: "Coimbatore",
      address: "DB Road, RS Puram, Coimbatore 641002",
      rating: 4.6,
      reviewsCount: 1190,
      pricePerson: 900,
      priceTag: "₹₹",
      hours: "12:30 PM – 10:30 PM",
      image: "assets/images/asian-fusion.webp",
      timeSlots: ["1:30 PM", "7:30 PM", "8:15 PM", "9:00 PM"],
      featured: false,
      popular: true,
      occasion: ["Family Gatherings", "Casual Dining"],
      description: "Steaming bamboo dim sum baskets, Korean crisp chicken, Thai green curry bowls, and wok-tossed noodles bursting with vibrant herbs."
    },
    {
      id: "REST-010",
      name: "Artisan Roast Café",
      cuisine: "Artisanal Bakes & Coffee",
      category: "Cafés",
      location: "Fairlands, Salem",
      city: "Salem",
      address: "Meyyanur Main Road, Fairlands, Salem 636016",
      rating: 4.7,
      reviewsCount: 920,
      pricePerson: 500,
      priceTag: "₹",
      hours: "8:00 AM – 10:30 PM",
      image: "assets/images/cafes-desserts.webp",
      timeSlots: ["10:00 AM", "4:00 PM", "6:00 PM", "8:00 PM"],
      featured: false,
      popular: true,
      occasion: ["Casual Dining", "Work & Coffee"],
      description: "Single-origin pour-overs, flaky Parisian croissants, pistachio tarts, and comforting sourdough sandwiches in a bright minimalist garden café."
    },
    {
      id: "REST-011",
      name: "Royal Heritage Feast",
      cuisine: "Mughlai & Chettinad",
      category: "Family Restaurants",
      location: "Alagapuram, Salem",
      city: "Salem",
      address: "Saradha College Road, Alagapuram, Salem 636007",
      rating: 4.8,
      reviewsCount: 1340,
      pricePerson: 1050,
      priceTag: "₹₹₹",
      hours: "12:00 PM – 11:00 PM",
      image: "assets/images/family-gathering.webp",
      timeSlots: ["1:00 PM", "7:30 PM", "8:15 PM", "9:00 PM"],
      featured: false,
      popular: true,
      occasion: ["Family Gatherings", "Birthday Celebrations"],
      description: "Generous multi-course banquets, copper handi specialties, fragrant dum biryanis, and spacious family seating with personalized table service."
    },
    {
      id: "REST-012",
      name: "The Urban Grill",
      cuisine: "Contemporary Grill & Steaks",
      category: "Fine Dining",
      location: "Lavelle Road, Bengaluru",
      city: "Bengaluru",
      address: "22, Lavelle Road, Shanthala Nagar, Bengaluru 560001",
      rating: 4.9,
      reviewsCount: 2650,
      pricePerson: 1600,
      priceTag: "₹₹₹₹",
      hours: "6:30 PM – 11:30 PM",
      image: "assets/images/fine-dining-interior.webp",
      timeSlots: ["7:00 PM", "7:45 PM", "8:30 PM", "9:15 PM"],
      featured: true,
      popular: true,
      occasion: ["Business Dining", "Romantic Dinners", "Chef's Table"],
      description: "Premium charcoal-grilled cuts, charred seafood platters, aged cheeses, and an exquisite curated wine cellar with private sommelier tastings."
    }
  ];

  // Seed Initial Reservations
  const INITIAL_RESERVATIONS = [
    {
      id: "RES-1024",
      restaurantId: "REST-001",
      restaurantName: "The Olive Table",
      guestName: "Arun Kumar",
      email: "client@stackly.com",
      phone: "+91 98401 23456",
      date: "2026-10-28",
      time: "7:00 PM",
      guests: "2 Guests",
      occasion: "Romantic Dinners",
      specialRequests: "Window corner table with candlelight preferred.",
      status: "Confirmed",
      createdAt: "2026-10-25T14:30:00Z"
    },
    {
      id: "RES-1025",
      restaurantId: "REST-002",
      restaurantName: "Spice Garden",
      guestName: "Priya Sharma",
      email: "priya.s@example.com",
      phone: "+91 98765 43210",
      date: "2026-10-29",
      time: "7:30 PM",
      guests: "4 Guests",
      occasion: "Family Gatherings",
      specialRequests: "High chair for child, peaceful table.",
      status: "Pending",
      createdAt: "2026-10-26T08:15:00Z"
    },
    {
      id: "RES-1026",
      restaurantId: "REST-003",
      restaurantName: "Sakura House",
      guestName: "Vikram Sengupta",
      email: "vikram@techcorp.in",
      phone: "+91 99001 88776",
      date: "2026-10-30",
      time: "8:00 PM",
      guests: "3 Guests",
      occasion: "Business Meeting",
      specialRequests: "Omakase counter seating requested.",
      status: "Confirmed",
      createdAt: "2026-10-26T09:00:00Z"
    },
    {
      id: "RES-1027",
      restaurantId: "REST-004",
      restaurantName: "Terrace & Thyme",
      guestName: "Karthik Subramanian",
      email: "client@stackly.com",
      phone: "+91 94432 11223",
      date: "2026-10-31",
      time: "8:30 PM",
      guests: "5 Guests",
      occasion: "Birthday Celebrations",
      specialRequests: "Birthday cake presentation at 9:15 PM.",
      status: "Pending",
      createdAt: "2026-10-26T09:30:00Z"
    },
    {
      id: "RES-1028",
      restaurantId: "REST-007",
      restaurantName: "Seaside Resto",
      guestName: "Deepa Raman",
      email: "deepa.r@gmail.com",
      phone: "+91 98410 99887",
      date: "2026-10-24",
      time: "1:30 PM",
      guests: "2 Guests",
      occasion: "Casual Dining",
      specialRequests: "Outdoor deck table overlooking the sea.",
      status: "Completed",
      createdAt: "2026-10-20T11:00:00Z"
    }
  ];

  // Seed Categories
  const CATEGORIES = [
    { id: "all", name: "All Restaurants", icon: "utensils" },
    { id: "fine-dining", name: "Fine Dining", icon: "sparkles" },
    { id: "italian", name: "Italian", icon: "pizza" },
    { id: "indian", name: "Indian", icon: "flame" },
    { id: "japanese", name: "Japanese", icon: "fish" },
    { id: "cafes", name: "Cafés", icon: "coffee" },
    { id: "seafood", name: "Seafood", icon: "anchor" },
    { id: "rooftop", name: "Rooftop Dining", icon: "sun" },
    { id: "family", name: "Family Restaurants", icon: "users" }
  ];

  // Seed Experiences
  const EXPERIENCES = [
    {
      id: "EXP-1",
      title: "Sunday Garden Grand Brunch",
      restaurant: "The Olive Table • Chennai",
      date: "Every Sunday • 12:30 PM",
      price: "₹1,450 / person",
      image: "assets/images/sunday-brunch.webp",
      cuisine: "European & Continental",
      description: "Over 45 live counters featuring artisan cheeses, freshly tossed pastas, wood-fired pizzas, dessert towers, and live acoustic music."
    },
    {
      id: "EXP-2",
      title: "Chef's 7-Course Omakase Dinner",
      restaurant: "Sakura House • Bengaluru",
      date: "Thu – Sat • 7:30 PM",
      price: "₹2,800 / person",
      image: "assets/images/chefs-special.webp",
      cuisine: "Japanese Contemporary",
      description: "An intimate 8-seat counter experience guided personally by Chef Kenji, spotlighting seasonal sashimi and hand-charred Wagyu."
    },
    {
      id: "EXP-3",
      title: "Candlelit Rooftop Jazz Evening",
      restaurant: "Terrace & Thyme • Coimbatore",
      date: "Fridays • 8:00 PM",
      price: "₹1,200 / person",
      image: "assets/images/skyline-kitchen.webp",
      cuisine: "Modern Fusion",
      description: "Dine under starry skies with chilled artisanal mocktails, signature fusion small plates, and smooth live jazz melodies."
    },
    {
      id: "EXP-4",
      title: "Royal Chettinad Family Feast",
      restaurant: "Spice Garden • Chennai",
      date: "Saturdays & Sundays",
      price: "₹850 / person",
      image: "assets/images/restaurant-experience.webp",
      cuisine: "South Indian Heritage",
      description: "A traditional banana-leaf celebration showcasing heirloom spices, 14 heritage curries, fragrant biryanis, and slow-churned desserts."
    },
    {
      id: "EXP-5",
      title: "Artisanal Seasonal Tasting Menu",
      restaurant: "The Urban Grill • Bengaluru",
      date: "Daily • 8:00 PM",
      price: "₹2,200 / person",
      image: "assets/images/tasting-menu.webp",
      cuisine: "Contemporary Grill",
      description: "A multi-sensory culinary voyage pairing prime charcoal-grilled textures with farm-to-table root reductions."
    }
  ];

  // Seed Initial Customers
  const INITIAL_CUSTOMERS = [
    { id: "CUST-1", name: "Arun Kumar", email: "client@stackly.com", phone: "+91 98401 23456", reservationsCount: 8, status: "Active VIP", memberSince: "Aug 2025" },
    { id: "CUST-2", name: "Priya Sharma", email: "priya.s@example.com", phone: "+91 98765 43210", reservationsCount: 4, status: "Active", memberSince: "Nov 2025" },
    { id: "CUST-3", name: "Vikram Sengupta", email: "vikram@techcorp.in", phone: "+91 99001 88776", reservationsCount: 12, status: "Active VIP", memberSince: "Jan 2025" },
    { id: "CUST-4", name: "Deepa Raman", email: "deepa.r@gmail.com", phone: "+91 98410 99887", reservationsCount: 3, status: "Active", memberSince: "Feb 2026" }
  ];

  // Initialize Storage
  function initStorage() {
    if (!localStorage.getItem("stackly_restaurants")) {
      localStorage.setItem("stackly_restaurants", JSON.stringify(INITIAL_RESTAURANTS));
    }
    if (!localStorage.getItem("stackly_reservations")) {
      localStorage.setItem("stackly_reservations", JSON.stringify(INITIAL_RESERVATIONS));
    }
    if (!localStorage.getItem("stackly_favorites")) {
      localStorage.setItem("stackly_favorites", JSON.stringify(["REST-001", "REST-003", "REST-005"]));
    }
    if (!localStorage.getItem("stackly_customers")) {
      localStorage.setItem("stackly_customers", JSON.stringify(INITIAL_CUSTOMERS));
    }
  }

  initStorage();

  return {
    getRestaurants: () => JSON.parse(localStorage.getItem("stackly_restaurants") || "[]"),
    saveRestaurants: (list) => localStorage.setItem("stackly_restaurants", JSON.stringify(list)),
    
    getReservations: () => JSON.parse(localStorage.getItem("stackly_reservations") || "[]"),
    saveReservations: (list) => localStorage.setItem("stackly_reservations", JSON.stringify(list)),

    getFavorites: () => JSON.parse(localStorage.getItem("stackly_favorites") || "[]"),
    saveFavorites: (list) => localStorage.setItem("stackly_favorites", JSON.stringify(list)),

    getCustomers: () => JSON.parse(localStorage.getItem("stackly_customers") || "[]"),

    getCategories: () => CATEGORIES,
    getExperiences: () => EXPERIENCES,

    addReservation: (reservationData) => {
      const current = JSON.parse(localStorage.getItem("stackly_reservations") || "[]");
      const newId = "RES-" + (1028 + current.length + 1);
      const newRes = {
        id: newId,
        status: "Pending",
        createdAt: new Date().toISOString(),
        ...reservationData
      };
      current.unshift(newRes);
      localStorage.setItem("stackly_reservations", JSON.stringify(current));
      return newRes;
    },

    toggleFavorite: (restaurantId) => {
      const favs = JSON.parse(localStorage.getItem("stackly_favorites") || "[]");
      const idx = favs.indexOf(restaurantId);
      if (idx > -1) {
        favs.splice(idx, 1);
      } else {
        favs.push(restaurantId);
      }
      localStorage.setItem("stackly_favorites", JSON.stringify(favs));
      return favs.includes(restaurantId);
    },

    isFavorite: (restaurantId) => {
      const favs = JSON.parse(localStorage.getItem("stackly_favorites") || "[]");
      return favs.includes(restaurantId);
    }
  };
})();

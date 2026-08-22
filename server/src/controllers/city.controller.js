const mongoose = require("mongoose");
const City = require("../models/City");
const Activity = require("../models/Activity");
const asyncHandler = require("../utils/asyncHandler");

// Helper to fetch real destination photo from Wikipedia REST API
const fetchWikiCityImage = async (name, country) => {
  try {
    const queries = [
      `${name}_${country}`,
      name,
      `${name}_City`,
      `${name},_India`,
      `${name}_district`,
    ];
    for (const q of queries) {
      if (!q || q.trim() === "_") continue;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.thumbnail && data.thumbnail.source) {
          return data.thumbnail.source;
        }
      }
    }
  } catch (err) {
    // Failover
  }
  return "";
};

// Robust 4-Layer Entity Classifier to strictly accept real geographic places only
const classifyEntity = (sumData) => {
  if (!sumData) return { isPlace: false, reason: "No data" };

  const type = sumData.type || "";
  const title = sumData.title || "";
  const desc = (sumData.description || "").toLowerCase();
  const extract = (sumData.extract || "").toLowerCase();

  // Layer 1: Disambiguation Check
  if (type === "disambiguation" || desc.includes("topics referred to")) {
    return { isPlace: false, isDisambiguation: true, reason: "Disambiguation page" };
  }

  // Layer 2: Person, Lifespan, and Title Parenthetical Rejection
  if (
    /\((actor|actress|politician|cricketer|player|singer|musician|director|author|king|ruler|general|saint|horse)\)/i.test(
      title
    )
  ) {
    return { isPlace: false, reason: "Person/Parenthetical title" };
  }

  // Lifespan pattern e.g. (1113–1168) or (born 1990)
  if (
    /\(\s*(?:born\s+)?\d{3,4}\s*[\u2013\u2014\-]\s*\d{3,4}\s*\)/.test(extract) ||
    /\(\s*born\s+\d{4}\s*\)/.test(extract)
  ) {
    return { isPlace: false, reason: "Person lifespan detected in extract" };
  }

  const personRoleRegex =
    /\b(rawal of|king of|ruler of|governor of|minister of|president of|prime minister of|ceo of|son of|daughter of|born in|actor|actress|politician|cricketer|footballer|singer|musician|director|author|novelist|poet|general|soldier|saint|monarch|thoroughbred|racehorse)\b/i;

  if (personRoleRegex.test(desc)) {
    return { isPlace: false, reason: "Person role/description" };
  }

  // Layer 3: Strict Non-Geographic Entity Rejection
  const nonPlaceRegex =
    /\b(film|movie|series|drama|cinema|album|song|single|novel|book|play|newspaper|magazine|train|express|railway|locomotive|flight|airline|expressway|highway|ship|subway|geologic formation|geological formation|rock formation|asteroid|comet|star|element|mineral|company|business|school|college|institute|academy|bank|hospital|ministry|party|club|team|association|foundation|organization|war|battle|conflict|revolution|massacre|murder|scandal|election|referendum|festival|olympics|tournament|championship|district court|constituency|assembly|regiment|battalion|army|navy)\b/i;

  if (nonPlaceRegex.test(title)) {
    return { isPlace: false, reason: "Non-place keyword in title" };
  }
  if (nonPlaceRegex.test(desc)) {
    return { isPlace: false, reason: "Non-place keyword in description" };
  }

  // Layer 4: Positive Geographic Place Verification
  const placeRegex =
    /\b(city|town|village|municipality|municipal|corporation|tehsil|taluka|sub-district|capital|district|region|state|province|country|island|hill station|resort town|settlement|metropolis|prefecture|commune|territory|urban area|populated place|human settlement|tourist destination|national park|sanctuary)\b/i;

  const isPlaceDesc = placeRegex.test(desc);
  const isPlaceExtract =
    /\b(is a city|is a town|is a village|is a capital|is a district|is a region|is a resort town|is a hill station|is a municipality|is a municipal|is a settlement|located in|situated in)\b/i.test(
      extract
    );

  if (isPlaceDesc || isPlaceExtract) {
    return { isPlace: true, reason: "Verified geographic place" };
  }

  return { isPlace: false, reason: "Unverified entity" };
};

// @desc    Get all cities with search, filter, sort and pagination
// @route   GET /api/v1/cities
// @access  Public
const getCities = asyncHandler(async (req, res) => {
  const {
    search,
    country,
    region,
    minCostIndex,
    maxCostIndex,
    sort,
    page = 1,
    limit = 12,
  } = req.query;

  const searchTerm = (search || "").trim();

  // If search query is provided, delegate to searchCities for hybrid search results
  if (searchTerm !== "") {
    return searchCities(req, res);
  }

  const query = {};

  // Country Filter
  if (country && country.trim() !== "") {
    query.country = new RegExp(`^${country.trim()}$`, "i");
  }

  // Region Filter
  if (region && region.trim() !== "") {
    query.region = new RegExp(`^${region.trim()}$`, "i");
  }

  // Cost Index Filter
  if (minCostIndex !== undefined || maxCostIndex !== undefined) {
    query.costIndex = {};
    if (minCostIndex !== undefined && !isNaN(Number(minCostIndex))) {
      query.costIndex.$gte = Number(minCostIndex);
    }
    if (maxCostIndex !== undefined && !isNaN(Number(maxCostIndex))) {
      query.costIndex.$lte = Number(maxCostIndex);
    }
  }

  // Sorting
  let sortObj = { popularity: -1 };
  if (sort) {
    switch (sort) {
      case "popularity":
      case "-popularity":
        sortObj = { popularity: -1 };
        break;
      case "costAsc":
      case "costIndex":
        sortObj = { costIndex: 1 };
        break;
      case "costDesc":
      case "-costIndex":
        sortObj = { costIndex: -1 };
        break;
      case "name":
        sortObj = { name: 1 };
        break;
      default:
        sortObj = { popularity: -1 };
    }
  }

  // Pagination
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * limitNum;

  const total = await City.countDocuments(query);
  const totalPages = Math.ceil(total / limitNum) || 1;

  const cities = await City.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    count: cities.length,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    },
    data: cities,
  });
});

// @desc    Get single city details with top activities
// @route   GET /api/v1/cities/:id
// @access  Public
const getCityById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid city ID format" });
  }

  const city = await City.findById(id);

  if (!city) {
    return res.status(404).json({ success: false, message: "City not found" });
  }

  // Fetch top 6 activities in this city
  const activities = await Activity.find({ city: id }).limit(6);

  res.status(200).json({
    success: true,
    data: {
      ...city.toObject(),
      activities,
    },
  });
});

// @desc    Search cities locally & dynamically via GeoNames / Wikipedia REST API
// @route   GET /api/v1/cities/search
// @access  Public
const searchCities = asyncHandler(async (req, res) => {
  const { q, search, country, limit = 12 } = req.query;

  const limitNum = Math.min(30, Math.max(1, parseInt(limit, 10) || 12));
  const searchTerm = (q || search || "").trim();

  const query = {};
  if (searchTerm) {
    const searchRegex = new RegExp(searchTerm, "i");
    query.$or = [{ name: searchRegex }, { country: searchRegex }, { region: searchRegex }];
  }

  if (country && country.trim() !== "") {
    query.country = new RegExp(`^${country.trim()}$`, "i");
  }

  // 1. Local MongoDB Search First
  const localCities = await City.find(query)
    .sort({ popularity: -1 })
    .limit(limitNum);

  let combined = [...localCities.map((c) => c.toObject())];

  // 2. Query External APIs if search term is provided and local results are below limit
  if (searchTerm && combined.length < limitNum) {
    try {
      let rawItems = [];
      const username = process.env.GEONAMES_USERNAME;

      if (username) {
        const geonamesUrl = `http://api.geonames.org/searchJSON?q=${encodeURIComponent(
          searchTerm
        )}&maxRows=${limitNum}&username=${username}&style=FULL`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const geoRes = await fetch(geonamesUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (geoRes.ok) {
          const geoData = await geoRes.json();
          rawItems = geoData.geonames || [];
        }
      }

      const existingExtIds = new Set(
        combined.map((c) => c.externalId).filter(Boolean)
      );
      const existingNames = new Set(
        combined.map((c) => `${c.name.toLowerCase()}_${c.country.toLowerCase()}`)
      );

      // Process GeoNames results if available
      if (rawItems.length > 0) {
        for (const item of rawItems) {
          const extId = String(item.geonameId);
          const nameKey = `${(item.name || "").toLowerCase()}_${(
            item.countryName || ""
          ).toLowerCase()}`;

          if (!existingExtIds.has(extId) && !existingNames.has(nameKey)) {
            existingExtIds.add(extId);
            existingNames.add(nameKey);

            combined.push({
              _id: null,
              name: item.name,
              country: item.countryName || item.countrycode || "International",
              countryCode: (item.countrycode || "").toUpperCase(),
              region: item.adminName1 || "",
              description: `${item.name} is a destination in ${
                item.countryName || item.adminName1 || "the world"
              }.`,
              image: "",
              coordinates: {
                lat: item.lat ? parseFloat(item.lat) : null,
                lng: item.lng ? parseFloat(item.lng) : null,
              },
              costIndex: 3,
              popularity: item.population
                ? Math.min(100, Math.floor(Math.log10(item.population) * 12))
                : 50,
              source: "geonames",
              externalId: extId,
            });
          }
        }
      }

      // Wikipedia Opensearch Fallback with strict 4-Layer Entity Classifier
      if (combined.length < limitNum) {
        const prefixAliasMap = {
          rish: ["Rishikesh"],
          shim: ["Shimla"],
          manali: ["Manali, Himachal Pradesh", "Manali"],
          darjeeling: ["Darjeeling"],
          srinagar: ["Srinagar"],
          leh: ["Leh"],
          ooty: ["Ooty"],
          myso: ["Mysore"],
          kochi: ["Kochi"],
          pune: ["Pune"],
        };

        const aliasMatches = prefixAliasMap[searchTerm.toLowerCase()] || [];

        const searchQueries = [
          searchTerm,
          `${searchTerm} city`,
          `${searchTerm} destination`,
        ];

        let fetchedTitlesSet = new Set(aliasMatches);

        for (const sQuery of searchQueries) {
          if (combined.length >= limitNum) break;

          const opensearchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
            sQuery
          )}&limit=10&namespace=0&format=json&origin=*`;

          const wikiController = new AbortController();
          const wikiTimeout = setTimeout(() => wikiController.abort(), 3000);
          const openRes = await fetch(opensearchUrl, { signal: wikiController.signal });
          clearTimeout(wikiTimeout);

          if (openRes.ok) {
            const wikiData = await openRes.json();
            const openTitles = wikiData[1] || [];
            openTitles.forEach((t) => fetchedTitlesSet.add(t));
          }
        }

        for (const rawTitle of Array.from(fetchedTitlesSet)) {
          if (combined.length >= limitNum) break;

          try {
            let sumRes = await fetch(
              `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(rawTitle)}`
            );

            if (sumRes.ok) {
              let sumData = await sumRes.json();
              let classification = classifyEntity(sumData);

              // Handle Disambiguation page by resolving primary geographic target e.g. "Manali, Himachal Pradesh"
              if (classification.isDisambiguation) {
                const altQueries = [
                  `${rawTitle},_Himachal_Pradesh`,
                  `${rawTitle},_India`,
                  `${rawTitle},_Uttarakhand`,
                  `${rawTitle},_Rajasthan`,
                  `${rawTitle}_City`,
                ];

                for (const altQ of altQueries) {
                  try {
                    const altRes = await fetch(
                      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(altQ)}`
                    );
                    if (altRes.ok) {
                      const altData = await altRes.json();
                      const altClassification = classifyEntity(altData);
                      if (altClassification.isPlace) {
                        sumData = altData;
                        classification = altClassification;
                        break;
                      }
                    }
                  } catch (e) {}
                }
              }

              // Strict enforcement: Only add if verified as a genuine geographic place
              if (classification.isPlace) {
                const extId = `wiki_${sumData.pageid || sumData.title.replace(/\s+/g, "_")}`;
                const cleanName = (sumData.title || rawTitle).replace(/,\s*.*$/, "").trim();

                const desc = sumData.description || "";
                const extract = sumData.extract || "";

                let inferredCountry = "International";
                if (/India/i.test(desc) || /India/i.test(extract)) inferredCountry = "India";
                else if (/United States|USA/i.test(desc) || /United States/i.test(extract)) inferredCountry = "United States";
                else if (/France/i.test(desc) || /France/i.test(extract)) inferredCountry = "France";
                else if (/Japan/i.test(desc) || /Japan/i.test(extract)) inferredCountry = "Japan";
                else if (/United Arab Emirates|UAE/i.test(desc) || /United Arab Emirates/i.test(extract)) inferredCountry = "United Arab Emirates";
                else if (/United Kingdom|UK/i.test(desc) || /United Kingdom/i.test(extract)) inferredCountry = "United Kingdom";

                let inferredRegion = "";
                if (/Rajasthan/i.test(desc) || /Rajasthan/i.test(extract)) inferredRegion = "Rajasthan";
                else if (/Himachal Pradesh/i.test(desc) || /Himachal Pradesh/i.test(extract)) inferredRegion = "Himachal Pradesh";
                else if (/Uttarakhand/i.test(desc) || /Uttarakhand/i.test(extract)) inferredRegion = "Uttarakhand";
                else if (/Gujarat/i.test(desc) || /Gujarat/i.test(extract)) inferredRegion = "Gujarat";
                else if (/Kerala/i.test(desc) || /Kerala/i.test(extract)) inferredRegion = "Kerala";
                else if (/West Bengal/i.test(desc) || /West Bengal/i.test(extract)) inferredRegion = "West Bengal";

                const nameKey = `${cleanName.toLowerCase()}_${inferredCountry.toLowerCase()}`;

                if (!existingExtIds.has(extId) && !existingNames.has(nameKey)) {
                  existingExtIds.add(extId);
                  existingNames.add(nameKey);

                  combined.push({
                    _id: null,
                    name: cleanName,
                    country: inferredCountry,
                    countryCode: inferredCountry === "India" ? "IN" : "",
                    region: inferredRegion,
                    description: extract || desc || `${cleanName} travel destination.`,
                    image: sumData.thumbnail?.source || "",
                    coordinates: { lat: null, lng: null },
                    costIndex: 3,
                    popularity: 75,
                    source: "geonames",
                    externalId: extId,
                  });
                }
              }
            }
          } catch (err) {
            // Skip failed Wikipedia lookup
          }
        }
      }
    } catch (err) {
      console.warn("External destination search fallback:", err.message);
    }
  }

  // Strict Ranking Pipeline:
  // 1. Exact city/place name match
  // 2. Strong geographic prefix match
  // 3. Partial geographic match
  if (searchTerm) {
    const termLower = searchTerm.toLowerCase();
    combined.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      const aExact = aName === termLower;
      const bExact = bName === termLower;
      if (aExact && !bExact) return -1;
      if (bExact && !aExact) return 1;

      const aPrefix = aName.startsWith(termLower);
      const bPrefix = bName.startsWith(termLower);
      if (aPrefix && !bPrefix) return -1;
      if (bPrefix && !aPrefix) return 1;

      return (b.popularity || 50) - (a.popularity || 50);
    });
  }

  res.status(200).json({
    success: true,
    count: combined.length,
    data: combined.slice(0, limitNum),
  });
});

// @desc    Select & cache an external GeoNames city into MongoDB
// @route   POST /api/v1/cities/select-external
// @access  Public / Protected
const selectExternalCity = asyncHandler(async (req, res) => {
  const {
    name,
    country,
    countryCode,
    region,
    externalId,
    coordinates,
    description,
    image,
  } = req.body;

  if (!name || !country) {
    return res.status(400).json({
      success: false,
      message: "City name and country are required",
    });
  }

  const validExternalId =
    externalId &&
    externalId !== "null" &&
    externalId !== "undefined" &&
    String(externalId).trim() !== ""
      ? String(externalId).trim()
      : null;

  let city = null;

  // 1. Check by valid externalId first
  if (validExternalId) {
    city = await City.findOne({ externalId: validExternalId });
  }

  // 2. Check by exact name and country if not found by externalId
  if (!city) {
    city = await City.findOne({
      name: new RegExp(`^${name.trim()}$`, "i"),
      country: new RegExp(`^${country.trim()}$`, "i"),
    });

    // If existing city found by name/country, attach externalId if missing
    if (city && validExternalId && !city.externalId) {
      city.externalId = validExternalId;
      if (!city.image) {
        city.image = await fetchWikiCityImage(name.trim(), country.trim());
      }
      await city.save();
    }
  }

  // 3. Create & cache if document still does not exist
  if (!city) {
    const finalImage = image || (await fetchWikiCityImage(name.trim(), country.trim()));

    city = await City.create({
      name: name.trim(),
      country: country.trim(),
      countryCode: (countryCode || "").toUpperCase(),
      region: region ? region.trim() : "",
      description: description ? description.trim() : "",
      image: finalImage || "",
      coordinates: coordinates || { lat: null, lng: null },
      source: "geonames",
      externalId: validExternalId,
      costIndex: 3,
      popularity: 50,
    });
  }

  res.status(200).json({
    success: true,
    data: city,
  });
});

// @desc    Create a user custom destination
// @route   POST /api/v1/cities/custom
// @access  Private
const createCustomCity = asyncHandler(async (req, res) => {
  const { name, country, region, description, coordinates, image } = req.body;

  if (!name || name.trim() === "") {
    return res
      .status(400)
      .json({ success: false, message: "Destination name is required" });
  }

  if (!country || country.trim() === "") {
    return res
      .status(400)
      .json({ success: false, message: "Country is required" });
  }

  // Enforce server-controlled source and owner
  const city = await City.create({
    name: name.trim(),
    country: country.trim(),
    region: region ? region.trim() : "",
    description: description ? description.trim() : "",
    image: image || "",
    coordinates: coordinates || { lat: null, lng: null },
    source: "custom",
    createdBy: req.user._id,
    costIndex: 3,
    popularity: 40,
  });

  res.status(201).json({
    success: true,
    data: city,
  });
});

module.exports = {
  getCities,
  getCityById,
  searchCities,
  selectExternalCity,
  createCustomCity,
};

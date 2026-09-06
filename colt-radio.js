(function initializeColtRadio(globalObject) {
  "use strict";

  const stations = [
    {
      id: "studying",
      label: "Lo-Fi • Study",
      type: "stream",
      source: "https://radio.loficafe.net/listen/studying/radio.mp3",
      provider: "Lofi Cafe",
      metadataEndpoint: "https://radio.loficafe.net/api/nowplaying/studying",
      metadataFormat: "azuraNowPlaying",
      note: "Free, ad-free study music streamed by Lofi Cafe. No account required."
    },
    {
      id: "working",
      label: "Lo-Fi • Focus",
      type: "stream",
      source: "https://radio.loficafe.net/listen/working/radio.mp3",
      provider: "Lofi Cafe",
      metadataEndpoint: "https://radio.loficafe.net/api/nowplaying/working",
      metadataFormat: "azuraNowPlaying",
      note: "Free, ad-free work music streamed by Lofi Cafe. No account required."
    },
    {
      id: "chilling",
      label: "Lo-Fi • Chill",
      type: "stream",
      source: "https://radio.loficafe.net/listen/chilling/radio.mp3",
      provider: "Lofi Cafe",
      metadataEndpoint: "https://radio.loficafe.net/api/nowplaying/chilling",
      metadataFormat: "azuraNowPlaying",
      note: "Free, ad-free chill music streamed by Lofi Cafe. No account required."
    },
    {
      id: "sleeping",
      label: "Lo-Fi • Sleep",
      type: "stream",
      source: "https://radio.loficafe.net/listen/sleeping/radio.mp3",
      provider: "Lofi Cafe",
      metadataEndpoint: "https://radio.loficafe.net/api/nowplaying/sleeping",
      metadataFormat: "azuraNowPlaying",
      note: "Free, ad-free soft lofi streamed by Lofi Cafe for quiet work and calm classroom moments. No account required."
    },
    {
      id: "gaming",
      label: "Lo-Fi • Gaming",
      type: "stream",
      source: "https://radio.loficafe.net/listen/gaming/radio.mp3",
      provider: "Lofi Cafe",
      metadataEndpoint: "https://radio.loficafe.net/api/nowplaying/gaming",
      metadataFormat: "azuraNowPlaying",
      note: "Free, ad-free instrumental lofi with a little more energy, streamed by Lofi Cafe. No account required."
    },
    {
      id: "japanese-lofi",
      label: "Lo-Fi • Japan",
      type: "stream",
      source: "https://radio.loficafe.net/listen/japanese-lofi/radio.mp3",
      provider: "Lofi Cafe",
      metadataEndpoint: "https://radio.loficafe.net/api/nowplaying/japanese-lofi",
      metadataFormat: "azuraNowPlaying",
      note: "Free, ad-free Japanese-inspired instrumental lofi streamed by Lofi Cafe. No account required."
    },
    {
      id: "lofi-fm",
      label: "Lo-Fi • Hip-Hop",
      type: "playlist",
      sources: [
        "https://lofi.radio/songs/42.mp3",
        "https://lofi.radio/songs/A Place to Hide.mp3",
        "https://lofi.radio/songs/Adrift.mp3",
        "https://lofi.radio/songs/Aether.mp3",
        "https://lofi.radio/songs/After Hours.mp3",
        "https://lofi.radio/songs/After the Rain.mp3",
        "https://lofi.radio/songs/Alien Sky.mp3",
        "https://lofi.radio/songs/Alienated.mp3",
        "https://lofi.radio/songs/All Curled Up.mp3",
        "https://lofi.radio/songs/Alley Cat.mp3"
      ],
      note: "Free, ad-free lo-fi hip hop by Purrple Cat. Tracks change automatically. No account required."
    },
    {
      id: "chillsynth",
      label: "Synth • Chill",
      type: "stream",
      source: "https://stream.nightride.fm/chillsynth.mp3",
      metadataMount: "/chillsynth.mp3",
      note: "Instrumental chillsynth and chillwave streamed by Nightride FM. No account required."
    },
    {
      id: "datawave",
      label: "Synth • Datawave",
      type: "stream",
      source: "https://stream.nightride.fm/datawave.mp3",
      metadataMount: "/datawave.mp3",
      note: "Instrumental electronic and retro-computing music streamed by Nightride FM. No account required."
    },
    {
      id: "nightride",
      label: "Synth • Nightdrive",
      type: "stream",
      source: "https://stream.nightride.fm/nightride.mp3",
      metadataMount: "/nightride.mp3",
      note: "Synthwave, retrowave, and outrun music streamed live by Nightride FM. No account required."
    },
    {
      id: "spacesynth",
      label: "Synth • Space",
      type: "stream",
      source: "https://stream.nightride.fm/spacesynth.mp3",
      provider: "Nightride FM",
      metadataEndpoint: "https://stream.nightride.fm/status-json.xsl",
      metadataMount: "/spacesynth.mp3",
      note: "Spacesynth, space disco, and retro electronic music streamed live by Nightride FM. No account required."
    },
    {
      id: "cotn-radio",
      label: "Electronic • Lounge",
      type: "stream",
      source: "https://streaming.smartradio.ch:8510/stream",
      provider: "COTN Radio",
      metadataEndpoint: "https://onlineradiobox.com/json/ch/reaturesfightadio/playlist",
      metadataFormat: "onlineRadioBox",
      note: "Modern lounge, chillout, ambient, chillhouse, and deep-house music streamed by COTN Radio. Free, ad-free, and no account required."
    },
    {
      id: "ssr-electronica",
      label: "Electronic • Dance",
      type: "stream",
      source: "https://systrum.net:8443/SSR2",
      provider: "Systrum Sistum",
      metadataEndpoint: "https://systrum.net:8443/status-json.xsl",
      metadataMount: "/SSR2",
      note: "Modern electronica and dance music streamed by the nonprofit Systrum Sistum station. No account required."
    },
    {
      id: "radio-abf",
      label: "Electronic • Club",
      type: "stream",
      source: "https://stream.radioabf.com/abf-sd.mp3",
      provider: "Radio ABF",
      metadataEndpoint: "https://stream.radioabf.com/status-json.xsl",
      metadataMount: "/abf-sd.mp3",
      note: "Modern house, techno, electronic music, and DJ mixes streamed by Radio ABF. Ad-free and no account required."
    },
    {
      id: "chill-house",
      label: "House • Chill",
      type: "stream",
      source: "https://stream.chillhouse-live.com/live",
      provider: "Chillhouse Live",
      note: "Warm deep-house and chill-house background music streamed by Chillhouse Live. No ads, no presenters, and no account required."
    },
    {
      id: "icf-worship",
      label: "Worship • Modern",
      type: "stream",
      source: "https://playerservices.streamtheworld.com/api/livestream-redirect/SP_R4750372.aac",
      provider: "ICF Radio",
      metadataEndpoint: "https://listen.samcloud.com/webapi/station/139286/history/npe?token=0fadd322e13a4d70b77795d1fdbb0156d14371ff&format=json",
      metadataFormat: "samCloudNowPlaying",
      note: "Modern worship music streamed by ICF Radio. Curated, ad-free, free of charge, and no account required."
    },
    {
      id: "god-radio",
      label: "Worship • Faith",
      type: "stream",
      source: "https://stream.wildfm.nl/GOD_Radio",
      provider: "GOD Media Network",
      metadataEndpoint: "https://ycpycskjlwukfsuizfnw.supabase.co/functions/v1/now-playing",
      metadataMethod: "POST",
      metadataHeaders: {
        apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljcHljc2tqbHd1a2ZzdWl6Zm53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2OTU0NjYsImV4cCI6MjA5MDI3MTQ2Nn0.U96v8k9IbBUI6H_mp4lXtOU5-IFi7dBuYao_XMAWX5c",
        "Content-Type": "application/json"
      },
      metadataBody: "{}",
      metadataFormat: "simpleTrack",
      note: "Worship music, Bible teaching, testimonies, and prayer streamed by GOD Radio. Free, no account required, and supported by donations and partners."
    },
    {
      id: "hpr4-bluegrass-gospel",
      label: "Worship • Bluegrass",
      type: "stream",
      source: "https://us2.maindigitalstream.com/ssl/7739",
      provider: "HPR4 Bluegrass Gospel",
      note: "Bluegrass Gospel music streamed commercial-free by listener-supported Heartland Public Radio. HPR states that its channels do not air indecent, vulgar, or offensive language."
    },
    {
      id: "joy-fm-main",
      label: "Christian • JOY FM",
      type: "stream",
      source: "https://rtn.cdnstream1.com/2579_96.aac",
      provider: "The JOY FM",
      note: "Contemporary Christian music and encouraging programs from The JOY FM's family-friendly main channel. Listener-supported and free to hear without a Colt Radio account."
    },
    {
      id: "game-soundtracks",
      label: "Games • Soundtracks",
      type: "stream",
      source: "https://icecast.gttradio.com/mp3_320k",
      provider: "Game That Tune Radio",
      metadataEndpoint: "https://icecast.gttradio.com/status-json.xsl",
      metadataMount: "/mp3_320k",
      note: "Video game music from more than 1,000 soundtracks, streamed by Game That Tune Radio. No Colt Radio account required."
    },
    {
      id: "laid-back-jazz",
      label: "Jazz • Laid-Back",
      type: "stream",
      source: "https://west-mp3-128.streamthejazzgroove.com/stream",
      provider: "The Jazz Groove",
      note: "Hand-selected, laid-back jazz streamed by the nonprofit, listener-supported Jazz Groove."
    },
    {
      id: "jazz-funk-soul",
      label: "Jazz • Funk & Soul",
      type: "stream",
      source: "https://stream.nucrooze.com/listen/nucrooze/radio.mp3",
      provider: "NUCROOZE",
      metadataEndpoint: "https://core.nucrooze.com/api/nowplaying/nucrooze",
      metadataFormat: "azuraNowPlaying",
      note: "Smooth jazz, funk, soul, Latin, and lounge music streamed by the independent, ad-free NUCROOZE station."
    },
    {
      id: "fantasy-adventure",
      label: "Fantasy • Adventure",
      type: "stream",
      source: "https://play.radiorivendell.com/radio/8000/radio.mp3",
      provider: "Radio Rivendell",
      metadataEndpoint: "/api/radio-metadata/rivendell",
      metadataFormat: "simpleTrack",
      note: "Fantasy, Celtic, film-style, and game-inspired music streamed by Radio Rivendell, with an emphasis on instrumentals."
    },
    {
      id: "oldies-jukebox",
      label: "Oldies • Jukebox",
      type: "stream",
      source: "https://manager11.streamradio.fr:2485/stream",
      provider: "Majestic Jukebox Radio",
      metadataEndpoint: "https://manager11.streamradio.fr:2485/status-json.xsl",
      metadataMount: "/stream",
      note: "Clean-version oldies, blues, jazz, swing, rock and roll, country, doo-wop, and big-band music from Majestic Jukebox Radio. Commercial-free."
    },
    {
      id: "smooth-jazz",
      label: "Jazz • Smooth",
      type: "stream",
      source: "https://443-1.autopo.st/171/stream/1/",
      provider: "RelaxingJazz.com",
      metadataEndpoint: "https://relaxingjazz.com/nowplaying.php?type=current",
      metadataFormat: "simpleTrack",
      note: "Commercial-free smooth jazz streamed by RelaxingJazz.com. No account required."
    },
    {
      id: "celtic-traditional",
      label: "Celtic • Traditional",
      type: "stream",
      source: "https://listen.ceol.fm/auto",
      provider: "Ceol FM",
      metadataEndpoint: "https://listen.ceol.fm/status-json.xsl",
      metadataMount: "/auto",
      note: "Irish traditional and folk music streamed by the listener-supported Ceol FM. No account required."
    },
    {
      id: "kpop-hits",
      label: "K-Pop • Hits",
      type: "stream",
      source: "https://cdn.onlyhitsradio.net/kpop",
      provider: "OnlyHit K-Pop",
      metadataEndpoint: "https://cdn.onlyhitsradio.net/currentsong/kpop",
      metadataFormat: "plainText",
      note: "K-pop hits, Korean R&B, and K-hip-hop streamed by OnlyHit K-Pop. No account required."
    },
    {
      id: "urban-heat",
      label: "Hip-Hop • Urban Heat",
      type: "stream",
      source: "https://stream.zeno.fm/hs2dndb7ydnuv",
      provider: "Urban Heat Radio",
      note: "Hip-hop, rap, R&B, jazz-hop, chill-hop, and trap streamed by Urban Heat Radio. No Colt Radio account required."
    },
    {
      id: "boost-positive",
      label: "Hip-Hop • Positive",
      type: "stream",
      source: "https://gateway.cdnstream1.com/boost-live",
      provider: "BOOST Radio",
      note: "Positive Christian hip-hop streamed commercial-free by BOOST Radio, with no profanity, misogyny, or messages of violence. No account required."
    },
    {
      id: "nova-instrumental",
      label: "Instrumental • Brazil",
      type: "stream",
      source: "https://streaming.radioempresabrasil.com.br/proxy/novainstrumental/stream",
      provider: "Rádio Nova Instrumental",
      note: "Instrumental favorites streamed from Brazil by Rádio Nova Instrumental. No Colt Radio account required."
    },
    {
      id: "fun-kids-soundtracks",
      label: "Movies • Soundtracks",
      type: "stream",
      source: "https://stream.rcs.revma.com/x8wbda03tm0uv",
      provider: "Fun Kids Soundtracks",
      metadataEndpoint: "https://funkids-feed-data.s3-eu-west-1.amazonaws.com/now-playing/fun-kids-soundtracks.json",
      metadataFormat: "simpleTrack",
      note: "Kid-friendly songs from Disney classics, Frozen, Trolls, High School Musical, and other TV and film soundtracks, streamed by Fun Kids."
    },
    {
      id: "wcpe-classical",
      label: "Classical",
      type: "stream",
      source: "https://audio-mp3.ibiblio.org/wcpe.mp3",
      provider: "WCPE The Classical Station",
      note: "Classical music streamed by the independent, listener-supported, noncommercial WCPE The Classical Station. No account required."
    },
    {
      id: "ambient-sleeping-pill",
      label: "Ambient • Sleeping Pill",
      type: "stream",
      source: "https://radio.stereoscenic.com/asp-h",
      provider: "Ambient Sleeping Pill",
      note: "Ad-free, beat-free ambient music for quiet work, reading, meditation, or relaxation, streamed by Ambient Sleeping Pill. No account required."
    },
    {
      id: "chilltrax",
      label: "Electronic • Chilltrax",
      type: "stream",
      source: "https://streamssl.chilltrax.com",
      provider: "Chilltrax",
      note: "Modern downtempo, electronica, and chillout music streamed by the nonprofit Chilltrax. The station states that its music is 100% free of advertising."
    },
    {
      id: "youradio-pop-kids",
      label: "Kids • Pop",
      type: "stream",
      source: "https://drive.uber.radio/uber/forkidzpophits/icecast.audio",
      provider: "YouRadio Pop Kids",
      note: "Commercial-free, kid-friendly pop hits curated for young listeners by YouRadio. No DJs, interruptions, or account required."
    },
    {
      id: "iheartcountry-family",
      label: "Country • Family",
      type: "stream",
      source: "https://stream.revma.ihrhls.com/zc7014",
      provider: "iHeartCountry Family",
      note: "Family-friendly, commercial-free country music streamed by iHeartCountry Family. No Colt Radio account required."
    },
    {
      id: "youradio-kids-movie-soundtracks",
      label: "Kids • Movie Music",
      type: "stream",
      source: "https://drive.uber.radio/uber/forkidzmoviesoundtracks/icecast.audio",
      provider: "YouRadio Movie Soundtracks",
      note: "Ad-free, family-friendly songs from animated films and children's movie soundtracks, streamed by YouRadio."
    },
    {
      id: "youradio-kidz-bop",
      label: "Kids • Kidz Bop",
      type: "stream",
      source: "https://drive.uber.radio/uber/forkidzkidzbop/icecast.audio",
      provider: "YouRadio Kidz Bop",
      note: "Ad-free, family-friendly versions of popular songs performed for young listeners, streamed by YouRadio."
    },
    {
      id: "youradio-calm-kids",
      label: "Kids • Calm",
      type: "stream",
      source: "https://drive.uber.radio/uber/calmkids/icecast.audio",
      provider: "YouRadio Calm Kids",
      note: "Ad-free calm, gentle music for quiet classroom work, reading, and relaxation, streamed by YouRadio."
    },
    {
      id: "hitbound-radio",
      label: "Pop • New Hits",
      type: "stream",
      source: "https://streaming.live365.com/a08639",
      provider: "HitBound Radio",
      note: "Current pop, rhythmic, and crossover discoveries streamed by HitBound Radio. The station describes its programming as family-friendly, always commercial-free, and free of ad breaks."
    },
    {
      id: "youradio-positively-focus",
      label: "Focus • Positive",
      type: "stream",
      source: "https://streaming.positivity.radio/pr-app/posisuccessful/icecast.audio",
      provider: "YouRadio Positively Focus",
      note: "Positive background music for concentration, studying, and focused classroom work, streamed commercial-free by YouRadio."
    },
    {
      id: "youradio-calm-instrumental",
      label: "Calm • Instrumental",
      type: "stream",
      source: "https://drive.uber.radio/uber-app/calminstrumental/icecast.audio",
      provider: "YouRadio Calm Soothing Instrumental",
      note: "Soothing instrumental music for quiet work, reading, and relaxation, streamed commercial-free by YouRadio."
    },
    {
      id: "youradio-positively-meditation",
      label: "Meditation • Positive",
      type: "stream",
      source: "https://streaming.positivity.radio/pr-app/posimeditation/icecast.audio",
      provider: "YouRadio Positively Meditation",
      note: "Peaceful meditation music for calm classroom moments and mindful breaks, streamed commercial-free by YouRadio."
    },
    {
      id: "youradio-calm-zen",
      label: "Calm • Zen",
      type: "stream",
      source: "https://drive.uber.radio/uber-app/calmzen/icecast.audio",
      provider: "YouRadio Calm Zen",
      note: "Gentle Zen-inspired music for calming down, reading, or quiet independent work, streamed commercial-free by YouRadio."
    },
    {
      id: "youradio-calm-rain",
      label: "Calm • Rain",
      type: "stream",
      source: "https://drive.uber.radio/uber-app/calmrain/icecast.audio",
      provider: "YouRadio Calm Rain",
      note: "Continuous calming rain sounds for focus, relaxation, and quiet classroom work, streamed commercial-free by YouRadio."
    },
    {
      id: "youradio-calm-tai-chi",
      label: "Calm • Tai Chi",
      type: "stream",
      source: "https://drive.uber.radio/uber-app/calmtaichi/icecast.audio",
      provider: "YouRadio Calm Tai Chi",
      note: "Gentle Tai Chi-inspired music for mindful movement, calm breaks, and quiet classroom focus, streamed commercial-free by YouRadio."
    },
    {
      id: "youradio-calm-spa",
      label: "Calm • Spa",
      type: "stream",
      source: "https://drive.uber.radio/uber-app/calmspa/icecast.audio",
      provider: "YouRadio Calm Spa",
      note: "Soft spa music for relaxation, reading, and a peaceful classroom atmosphere, streamed commercial-free by YouRadio."
    }
  ];
  const preferredStationKey = "classroomLaunchpadColtRadioStationV1";
  const preferredVolumeKey = "classroomLaunchpadColtRadioVolumeV1";
  const guestFavoritesKey = "classroomLaunchpadColtRadioFavoritesGuestV1";
  const hiddenScreens = new Set(["coltRun", "pin", "login", "account", "dashboard", "edit", "changePin"]);

  function buildElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = String(text);
    return element;
  }

  const stationIconPaths = {
    studying: '<path d="M6 4h9a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2Z"/><path d="M8 4v5h8V4M8 14h6"/>',
    working: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>',
    chilling: '<path d="M6 17h11a4 4 0 0 0 .4-8 6 6 0 0 0-11.2 2A3 3 0 0 0 6 17Z"/>',
    sleeping: '<path d="M19 15.5A8 8 0 0 1 8.5 5 8.5 8.5 0 1 0 19 15.5Z"/><path d="m16 4 .5 1.5L18 6l-1.5.5L16 8l-.5-1.5L14 6l1.5-.5Z"/>',
    gaming: '<path d="M8 8h8a5 5 0 0 1 4.7 6.8l-1 2.7a2 2 0 0 1-3.2.8L14.8 17H9.2l-1.7 1.3a2 2 0 0 1-3.2-.8l-1-2.7A5 5 0 0 1 8 8Z"/><path d="M8 11v4m-2-2h4m6-1h.01m2 2h.01"/>',
    "japanese-lofi": '<path d="M4 6h16M6 6v3m12-3v3M5 9h14M7 9v11m10-11v11M4 20h16"/>',
    "lofi-fm": '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M7 5V3h10v2M7 9h10M8 14h.01m3 0h6m-9 3h.01m3 0h6"/>',
    chillsynth: '<path d="M3 12h3l2-6 3 12 3-10 2 4h5"/>',
    datawave: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="m9 4 3 3 3-3M8 10h8v6H8zm2 9h4"/>',
    nightride: '<path d="M5 21 9 3m10 18L15 3M10 9h4m-5 5h6m-7 5h8"/>',
    spacesynth: '<circle cx="12" cy="12" r="5"/><path d="M3 15c2.5 2 7.2 2.2 11.7.3 4.4-1.8 7.2-4.6 6.2-6.1-.8-1.2-3-.9-5.6.2"/><path d="m18 4 .4 1.2L20 6l-1.6.8L18 8l-.4-1.2L16 6l1.6-.8Z"/>',
    "cotn-radio": '<path d="M5 13h14l2 7H3l2-7Z"/><path d="M8 13V7a3 3 0 0 1 6 0v6m1 0 2-7"/>',
    "ssr-electronica": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18m0-18a15 15 0 0 0 0 18"/>',
    "radio-abf": '<path d="m4 8 4 3 4-6 4 6 4-3-2 10H6L4 8Z"/><path d="M7 21h10"/>',
    "chill-house": '<path d="M4 20V10l8-6 8 6v10M8 20v-6h8v6"/><path d="M3 7c2-3 4-3 6-1M21 7c-2-3-4-3-6-1"/>',
    "icf-worship": '<path d="M5 21V9l7-6 7 6v12M9 21v-6h6v6M12 7v5m-2-3h4"/>',
    "god-radio": '<path d="M12 3v18M7 8h10"/><path d="M4 18c2-3 4-4 8-4s6 1 8 4"/>',
    "hpr4-bluegrass-gospel": '<circle cx="8" cy="15" r="4"/><circle cx="8" cy="15" r="1.5"/><path d="m11 12 7-8 2 2-8 7M16 6l2 2M5 19l-2 2"/>',
    "joy-fm-main": '<path d="M12 3v18M7 8h10"/><path d="M4 18c2-3 4-4 8-4s6 1 8 4"/><path d="m18 3 .5 1.5L20 5l-1.5.5L18 7l-.5-1.5L16 5l1.5-.5Z"/>',
    "game-soundtracks": '<path d="M8 8h8a5 5 0 0 1 4.7 6.8l-1 2.7a2 2 0 0 1-3.2.8L14.8 17H9.2l-1.7 1.3a2 2 0 0 1-3.2-.8l-1-2.7A5 5 0 0 1 8 8Z"/><path d="M8 11v4m-2-2h4m6-1h.01m2 2h.01"/>',
    "laid-back-jazz": '<path d="M15 4v11.5a3.5 3.5 0 1 1-2-3.2V6l7-2v9.5a3.5 3.5 0 1 1-2-3.2V4Z"/>',
    "jazz-funk-soul": '<path d="M5 16V6l10-2v10M5 9l10-2"/><circle cx="3.5" cy="17.5" r="2.5"/><circle cx="13.5" cy="15.5" r="2.5"/><path d="M19 5v8m-2-6h4"/>',
    "fantasy-adventure": '<path d="M5 21V9l3 2V6l4 3 4-3v5l3-2v12M9 21v-5h6v5"/><path d="M4 21h16"/>',
    "oldies-jukebox": '<path d="M7 21h10V10a5 5 0 0 0-10 0v11Z"/><path d="M9 11h6v5H9zm0 8h6M9 8h6"/>',
    "smooth-jazz": '<path d="M15 4v11.5a3.5 3.5 0 1 1-2-3.2V6l7-2v9.5a3.5 3.5 0 1 1-2-3.2V4Z"/>',
    "celtic-traditional": '<path d="M12 3c-3 3-4.5 6-4 9 1 5 7 6 9 2 1.5-3-.5-6-5-6-5 0-8 5-7 9 .8 3.2 4 5.5 7 5.5"/><path d="M12 8c2 2 3 4 2 6-1 2-4 2-5 0"/>',
    "kpop-hits": '<path d="m12 3 2.2 5.3L20 9l-4.3 3.7L17 18l-5-2.8L7 18l1.3-5.3L4 9l5.8-.7L12 3Z"/><path d="M5 21h14"/>',
    "urban-heat": '<path d="M8 4v10.5a3.5 3.5 0 1 1-2-3.2V6l10-2v8.5a3.5 3.5 0 1 1-2-3.2V4Z"/><path d="M17 17c1.5-1 2.5-2.5 3-4"/>',
    "boost-positive": '<path d="M8 4v10.5a3.5 3.5 0 1 1-2-3.2V6l10-2v8.5a3.5 3.5 0 1 1-2-3.2V4Z"/><path d="M17 17c1.5-1 2.5-2.5 3-4"/><path d="m19 3 .5 1.5L21 5l-1.5.5L19 7l-.5-1.5L17 5l1.5-.5Z"/>',
    "nova-instrumental": '<path d="M12 3v12.5a3.5 3.5 0 1 1-2-3.2V6l8-2v9.5a3.5 3.5 0 1 1-2-3.2V4Z"/><path d="M3 8c2-2 4-2 6 0m6 10c2-2 4-2 6 0"/>',
    "fun-kids-soundtracks": '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="m3 10 4-4 4 4 4-4 4 4M9 14h6m-3-2v4"/>',
    "wcpe-classical": '<path d="M4 20h16M6 17h12M8 17V9m4 8V9m4 8V9M5 8h14L12 3 5 8Z"/>',
    "ambient-sleeping-pill": '<path d="M19 15.5A8 8 0 0 1 8.5 5 8.5 8.5 0 1 0 19 15.5Z"/><path d="m16 4 .5 1.5L18 6l-1.5.5L16 8l-.5-1.5L14 6l1.5-.5Z"/>',
    chilltrax: '<path d="M6 17h11a4 4 0 0 0 .4-8 6 6 0 0 0-11.2 2A3 3 0 0 0 6 17Z"/><path d="M8 20h8"/>',
    "youradio-pop-kids": '<path d="M8 4v10.5a3.5 3.5 0 1 1-2-3.2V6l10-2v8.5a3.5 3.5 0 1 1-2-3.2V4Z"/><path d="m19 3 .5 1.5L21 5l-1.5.5L19 7l-.5-1.5L17 5l1.5-.5Z"/>',
    "iheartcountry-family": '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/><path d="M8 4h8M9 4l1-2m5 2-1-2"/>',
    "youradio-kids-movie-soundtracks": '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="m3 10 4-4 4 4 4-4 4 4M9 14h6m-3-2v4"/>',
    "youradio-kidz-bop": '<path d="m12 3 2.2 5.3L20 9l-4.3 3.7L17 18l-5-2.8L7 18l1.3-5.3L4 9l5.8-.7L12 3Z"/><path d="M5 21h14"/>',
    "youradio-calm-kids": '<path d="M19 15.5A8 8 0 0 1 8.5 5 8.5 8.5 0 1 0 19 15.5Z"/><path d="m16 4 .5 1.5L18 6l-1.5.5L16 8l-.5-1.5L14 6l1.5-.5Z"/>',
    "hitbound-radio": '<path d="M8 4v10.5a3.5 3.5 0 1 1-2-3.2V6l10-2v8.5a3.5 3.5 0 1 1-2-3.2V4Z"/><path d="m19 3 .5 1.5L21 5l-1.5.5L19 7l-.5-1.5L17 5l1.5-.5Z"/>',
    "youradio-positively-focus": '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>',
    "youradio-calm-instrumental": '<path d="M9 18V5l10-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/>',
    "youradio-positively-meditation": '<path d="M12 4c-2 3-3 5-3 7a3 3 0 0 0 6 0c0-2-1-4-3-7Z"/><path d="M5 20c1.5-3 3.8-4.5 7-4.5S17.5 17 19 20M7 20h10"/>',
    "youradio-calm-zen": '<path d="M12 3c2.5 3 4 5.5 4 8a4 4 0 0 1-8 0c0-2.5 1.5-5 4-8Z"/><path d="M4 20c2-2 4.7-3 8-3s6 1 8 3"/>',
    "youradio-calm-rain": '<path d="M7 15a4 4 0 1 1 1-7.9A5 5 0 0 1 17.7 9 3 3 0 0 1 18 15H7Z"/><path d="m8 18-1 2m5-2-1 2m5-2-1 2"/>',
    "youradio-calm-tai-chi": '<circle cx="12" cy="12" r="9"/><path d="M12 3a4.5 4.5 0 0 1 0 9 4.5 4.5 0 0 0 0 9"/><circle cx="12" cy="7.5" r="1"/><circle cx="12" cy="16.5" r="1"/>',
    "youradio-calm-spa": '<path d="M12 21c0-5 3-8 8-9 0 5-3 8-8 9Zm0 0c0-5-3-8-8-9 0 5 3 8 8 9Z"/><path d="M12 16c-3-3-3-7 0-11 3 4 3 8 0 11Z"/>'
  };

  function iconSvg(paths, className = "") {
    return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  }

  function volumeIconSvg(volume, muted = false) {
    const speaker = '<path d="M11 5 6.5 9H3v6h3.5l4.5 4V5Z"/>';
    if (muted || volume === 0) {
      return iconSvg(`${speaker}<path d="m16 9 5 6m0-6-5 6"/>`, "colt-radio-volume-icon");
    }
    const waves = volume < 45
      ? '<path d="M15 9.5a4 4 0 0 1 0 5"/>'
      : '<path d="M15 9.5a4 4 0 0 1 0 5M18 7a7.5 7.5 0 0 1 0 10"/>';
    return iconSvg(`${speaker}${waves}`, "colt-radio-volume-icon");
  }

  function stationIcon(stationId) {
    const icon = buildElement("span", "colt-radio-station-icon");
    icon.innerHTML = iconSvg(stationIconPaths[stationId] || stationIconPaths["lofi-fm"]);
    return icon;
  }

  function mountRadio() {
    const root = document.getElementById("coltRadioRoot");
    if (!root) return;

    const launcher = buildElement("button", "colt-radio-launcher");
    launcher.type = "button";
    launcher.setAttribute("aria-label", "Open Colt Radio");
    launcher.setAttribute("aria-expanded", "false");
    const launcherMark = buildElement("span", "colt-radio-launcher-mark", "♫");
    launcherMark.setAttribute("aria-hidden", "true");
    const launcherLabel = buildElement("span", "colt-radio-launcher-label", "Colt Radio");
    launcher.append(launcherMark, launcherLabel);

    const panel = buildElement("section", "colt-radio-panel");
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "false");
    panel.setAttribute("aria-labelledby", "coltRadioTitle");

    const header = buildElement("header", "colt-radio-header");
    const heading = buildElement("div", "colt-radio-heading");
    const headingMark = buildElement("span", "colt-radio-heading-mark");
    const headingHorse = document.createElement("img");
    headingHorse.dataset.src = "assets/colt-radio-header-portrait.png?v=20260905-radio-header-optimized";
    headingHorse.alt = "";
    headingHorse.setAttribute("aria-hidden", "true");
    headingMark.append(headingHorse);
    const headingText = buildElement("div");
    const kicker = buildElement("span", "feature-kicker", "Classroom Music");
    const title = buildElement("h2", "", "Colt Radio");
    title.id = "coltRadioTitle";
    headingText.append(kicker, title);
    heading.append(headingMark, headingText);

    const headerActions = buildElement("div", "colt-radio-header-actions");
    const minimize = buildElement("button", "colt-radio-icon-btn", "−");
    minimize.type = "button";
    minimize.setAttribute("aria-label", "Minimize Colt Radio");
    const stop = buildElement("button", "colt-radio-icon-btn", "×");
    stop.type = "button";
    stop.setAttribute("aria-label", "Stop Colt Radio");
    headerActions.append(minimize, stop);
    header.append(heading, headerActions);

    const stationFilters = buildElement("div", "colt-radio-filters");
    const allStationsFilter = buildElement("button", "colt-radio-filter is-active");
    allStationsFilter.type = "button";
    allStationsFilter.dataset.filter = "all";
    allStationsFilter.setAttribute("aria-pressed", "true");
    allStationsFilter.innerHTML = `${iconSvg('<path d="M5 6h14v12H5zM8 3h8v3M8 10h8M8 14h5"/>', "colt-radio-filter-icon")}<span>All Stations</span>`;
    const favoritesFilter = buildElement("button", "colt-radio-filter");
    favoritesFilter.type = "button";
    favoritesFilter.dataset.filter = "favorites";
    favoritesFilter.setAttribute("aria-pressed", "false");
    favoritesFilter.innerHTML = `${iconSvg('<path d="M20.8 5.8a5.5 5.5 0 0 0-7.8 0L12 6.8l-1-1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z"/>', "colt-radio-filter-icon")}<span data-favorites-label>Favorites (0)</span>`;
    stationFilters.append(allStationsFilter, favoritesFilter);

    const stationNav = buildElement("nav", "colt-radio-stations");
    stationNav.setAttribute("aria-label", "Choose a Colt Radio station");
    const stationButtons = stations.map(station => {
      const item = buildElement("div", "colt-radio-station-item");
      item.dataset.stationItem = station.id;
      const button = buildElement("button", "colt-radio-station");
      button.type = "button";
      button.dataset.station = station.id;
      button.setAttribute("aria-pressed", "false");
      const [stationFamily, stationStyle = ""] = station.label.split(" • ");
      const stationName = buildElement("span", "colt-radio-station-name");
      stationName.append(buildElement("span", "colt-radio-station-family", stationFamily));
      if (stationStyle) {
        stationName.append(
          document.createTextNode(" "),
          buildElement("span", "colt-radio-station-style", stationStyle)
        );
      }
      if (stationFamily.length > 9 || stationStyle.length > 9) item.classList.add("has-long-name");
      button.setAttribute("aria-label", station.label);
      button.append(stationIcon(station.id), stationName);
      const favorite = buildElement("button", "colt-radio-favorite", "☆");
      favorite.type = "button";
      favorite.dataset.favoriteStation = station.id;
      favorite.setAttribute("aria-label", `Add ${station.label} to favorites`);
      favorite.setAttribute("aria-pressed", "false");
      favorite.title = "Add to favorites";
      item.append(button, favorite);
      stationNav.append(item);
      return button;
    });
    const favoritesEmpty = buildElement("p", "colt-radio-favorites-empty", "No favorites yet. Select All Stations, then use a star to pin one here.");
    favoritesEmpty.hidden = true;
    stationNav.append(favoritesEmpty);

    const playerWrap = buildElement("div", "colt-radio-player");
    const placeholder = buildElement("p", "colt-radio-placeholder", "Choose a station, then press Play in the radio player.");
    const nowPlaying = buildElement("div", "colt-radio-now-playing colt-radio-stream-player");
    nowPlaying.hidden = true;
    nowPlaying.setAttribute("aria-live", "polite");
    const streamArtwork = buildElement("span", "colt-radio-stream-artwork");
    streamArtwork.setAttribute("aria-hidden", "true");
    const streamArtworkImage = document.createElement("img");
    streamArtworkImage.dataset.src = "assets/colt-radio-horse-portrait.png?v=20260905-radio-artwork-optimized";
    streamArtworkImage.alt = "";
    streamArtwork.append(streamArtworkImage);
    const streamDetails = buildElement("span", "colt-radio-stream-details");
    const nowPlayingLabel = buildElement("span", "colt-radio-stream-label", "Now Playing");
    const nowPlayingTitle = buildElement("strong", "", "Loading track information...");
    const liveBadge = buildElement("span", "colt-radio-live-badge", "READY");
    liveBadge.setAttribute("role", "status");
    liveBadge.setAttribute("aria-live", "polite");
    const equalizer = buildElement("span", "colt-radio-equalizer");
    for (let index = 0; index < 24; index += 1) equalizer.append(buildElement("i"));
    const volumeControl = buildElement("span", "colt-radio-volume");
    const muteStream = buildElement("button", "colt-radio-stream-control colt-radio-mute");
    muteStream.type = "button";
    muteStream.setAttribute("aria-label", "Mute Colt Radio");
    muteStream.innerHTML = volumeIconSvg(65);
    const volumeSlider = document.createElement("input");
    volumeSlider.className = "colt-radio-volume-slider";
    volumeSlider.type = "range";
    volumeSlider.min = "0";
    volumeSlider.max = "100";
    volumeSlider.step = "1";
    volumeSlider.value = "65";
    volumeSlider.setAttribute("aria-label", "Colt Radio volume");
    volumeSlider.title = "Colt Radio volume: 65%";
    volumeControl.append(muteStream, volumeSlider);
    streamDetails.append(nowPlayingLabel, nowPlayingTitle, liveBadge, equalizer, volumeControl);
    const toggleStream = buildElement("button", "colt-radio-stream-control colt-radio-play", "\u25b6");
    toggleStream.type = "button";
    toggleStream.setAttribute("aria-label", "Play Colt Radio");
    nowPlaying.append(streamArtwork, streamDetails, toggleStream);
    function createPlayerFrame() {
      const frame = document.createElement("iframe");
      frame.title = "Lofi Cafe radio player";
      frame.loading = "lazy";
      frame.referrerPolicy = "no-referrer";
      frame.setAttribute("allow", "autoplay");
      frame.setAttribute("sandbox", "allow-scripts allow-same-origin");
      frame.hidden = true;
      return frame;
    }
    function createAudioPlayer() {
      const audio = document.createElement("audio");
      audio.className = "colt-radio-audio";
      audio.preload = "auto";
      audio.disableRemotePlayback = true;
      audio.setAttribute("aria-label", "Colt Radio audio controls");
      audio.hidden = true;
      return audio;
    }
    let iframe = createPlayerFrame();
    const audio = createAudioPlayer();
    playerWrap.append(placeholder, iframe, nowPlaying, audio);

    const note = buildElement("p", "colt-radio-note", "Free, ad-free music streamed by Lofi Cafe. No account required.");
    panel.append(header, stationFilters, stationNav, playerWrap, note);
    root.append(launcher, panel);

    let activeStation = "";
    let playlistTrackIndex = -1;
    let metadataTimer = 0;
    let favoriteStationIds = new Set();
    let favoritesOnly = false;
    let favoritesAccountKey = "";
    let favoritesRequestVersion = 0;
    let connectionTimer = 0;
    let playbackRequestVersion = 0;
    let playbackAttempt = 0;
    let wantsPlayback = false;
    let suppressPauseState = false;
    const connectionTimeoutMs = 7000;

    function preferredVolume() {
      try {
        const storedVolume = localStorage.getItem(preferredVolumeKey);
        if (storedVolume === null || storedVolume === "") return 65;
        const savedVolume = Number(storedVolume);
        return Number.isFinite(savedVolume) && savedVolume >= 0 && savedVolume <= 100 ? savedVolume : 65;
      } catch (error) {
        return 65;
      }
    }

    function setVolume(value, { remember = true } = {}) {
      const volume = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
      audio.volume = volume / 100;
      audio.muted = volume === 0;
      volumeSlider.value = String(volume);
      volumeSlider.style.setProperty("--radio-volume", `${volume}%`);
      volumeSlider.title = `Colt Radio volume: ${volume}%`;
      muteStream.innerHTML = volumeIconSvg(volume, audio.muted);
      muteStream.setAttribute("aria-label", audio.muted ? "Unmute Colt Radio" : "Mute Colt Radio");
      if (remember) {
        try {
          localStorage.setItem(preferredVolumeKey, String(volume));
        } catch (error) {}
      }
    }

    setVolume(preferredVolume(), { remember: false });

    function preferredStation() {
      try {
        const savedStation = localStorage.getItem(preferredStationKey);
        return stations.some(station => station.id === savedStation) ? savedStation : "studying";
      } catch (error) {
        return "studying";
      }
    }

    function rememberStation(stationId) {
      try {
        localStorage.setItem(preferredStationKey, stationId);
      } catch (error) {}
    }

    function validFavoriteIds(values) {
      const knownIds = new Set(stations.map(station => station.id));
      return [...new Set((Array.isArray(values) ? values : []).filter(id => knownIds.has(id)))];
    }

    function renderFavorites() {
      const favoriteButtons = stationNav.querySelectorAll("[data-favorite-station]");
      favoriteButtons.forEach(button => {
        const selected = favoriteStationIds.has(button.dataset.favoriteStation);
        const station = stations.find(item => item.id === button.dataset.favoriteStation);
        button.textContent = selected ? "★" : "☆";
        button.classList.toggle("is-favorite", selected);
        button.setAttribute("aria-pressed", String(selected));
        button.setAttribute("aria-label", `${selected ? "Remove" : "Add"} ${station.label} ${selected ? "from" : "to"} favorites`);
        button.title = selected ? "Remove from favorites" : "Add to favorites";
      });
      const stationOrder = new Map(stations.map((station, index) => [station.id, index]));
      const stationItems = [...stationNav.querySelectorAll("[data-station-item]")];
      stationItems.sort((left, right) => {
        const favoriteDifference = Number(favoriteStationIds.has(right.dataset.stationItem))
          - Number(favoriteStationIds.has(left.dataset.stationItem));
        return favoriteDifference || stationOrder.get(left.dataset.stationItem) - stationOrder.get(right.dataset.stationItem);
      });
      stationItems.forEach(item => stationNav.insertBefore(item, favoritesEmpty));
      stationItems.forEach(item => {
        item.hidden = favoritesOnly && !favoriteStationIds.has(item.dataset.stationItem);
      });
      favoritesEmpty.hidden = !(favoritesOnly && favoriteStationIds.size === 0);
      const favoritesLabel = favoritesFilter.querySelector("[data-favorites-label]");
      if (favoritesLabel) favoritesLabel.textContent = `Favorites (${favoriteStationIds.size})`;
      allStationsFilter.classList.toggle("is-active", !favoritesOnly);
      favoritesFilter.classList.toggle("is-active", favoritesOnly);
      allStationsFilter.setAttribute("aria-pressed", String(!favoritesOnly));
      favoritesFilter.setAttribute("aria-pressed", String(favoritesOnly));
    }

    function guestFavorites() {
      try {
        return validFavoriteIds(JSON.parse(localStorage.getItem(guestFavoritesKey) || "[]"));
      } catch (error) {
        return [];
      }
    }

    function accountKey(auth) {
      if (!auth?.authenticated) return "guest";
      if (auth.role === "teacher") return "teacher";
      return auth.role === "student" && auth.email ? `student:${String(auth.email).toLowerCase()}` : "guest";
    }

    async function syncFavorites(auth) {
      const nextAccountKey = accountKey(auth);
      if (nextAccountKey === favoritesAccountKey) return;
      favoritesAccountKey = nextAccountKey;
      const requestVersion = ++favoritesRequestVersion;
      if (nextAccountKey === "guest") {
        favoriteStationIds = new Set(guestFavorites());
        renderFavorites();
        return;
      }
      try {
        const response = await fetch("/api/radio-favorites", { cache: "no-store" });
        if (!response.ok) throw new Error("Favorites unavailable");
        const payload = await response.json();
        if (requestVersion !== favoritesRequestVersion) return;
        favoriteStationIds = new Set(validFavoriteIds(payload.favorites));
      } catch (error) {
        if (requestVersion !== favoritesRequestVersion) return;
        favoriteStationIds = new Set();
      }
      renderFavorites();
    }

    async function saveFavorites() {
      const favorites = [...favoriteStationIds];
      if (favoritesAccountKey === "guest") {
        try {
          localStorage.setItem(guestFavoritesKey, JSON.stringify(favorites));
        } catch (error) {}
        return;
      }
      try {
        await fetch("/api/radio-favorites", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ favorites })
        });
      } catch (error) {}
    }

    function toggleFavorite(stationId) {
      if (!stations.some(station => station.id === stationId)) return;
      if (favoriteStationIds.has(stationId)) favoriteStationIds.delete(stationId);
      else favoriteStationIds.add(stationId);
      renderFavorites();
      saveFavorites();
    }

    function clearConnectionTimer() {
      if (connectionTimer) globalObject.clearTimeout(connectionTimer);
      connectionTimer = 0;
    }

    function setPlaybackState(state) {
      nowPlaying.dataset.playbackState = state;
      nowPlaying.classList.toggle("is-playing", state === "playing");
      nowPlaying.classList.toggle("is-connecting", state === "connecting" || state === "retrying" || state === "buffering");
      nowPlaying.classList.toggle("has-playback-error", state === "error");
      const labels = {
        idle: "READY",
        ready: "READY",
        connecting: "CONNECTING...",
        retrying: "RETRYING...",
        buffering: "BUFFERING...",
        playing: "● LIVE",
        error: "UNAVAILABLE"
      };
      liveBadge.textContent = labels[state] || labels.ready;
      if (state === "playing") {
        toggleStream.textContent = "\u275a\u275a";
        toggleStream.setAttribute("aria-label", "Pause Colt Radio");
      } else if (state === "connecting" || state === "retrying" || state === "buffering") {
        toggleStream.textContent = "\u275a\u275a";
        toggleStream.setAttribute("aria-label", "Cancel Colt Radio connection");
      } else {
        toggleStream.textContent = "\u25b6";
        toggleStream.setAttribute("aria-label", state === "error" ? "Retry Colt Radio" : "Play Colt Radio");
      }
    }

    function markPlaybackUnavailable(requestVersion) {
      if (requestVersion !== playbackRequestVersion) return;
      clearConnectionTimer();
      wantsPlayback = false;
      suppressPauseState = true;
      audio.pause();
      suppressPauseState = false;
      setPlaybackState("error");
    }

    function startPlaybackAttempt(requestVersion) {
      if (requestVersion !== playbackRequestVersion || !wantsPlayback) return;
      clearConnectionTimer();
      setPlaybackState(playbackAttempt ? "retrying" : "connecting");
      const attemptNumber = playbackAttempt;
      connectionTimer = globalObject.setTimeout(() => {
        if (requestVersion !== playbackRequestVersion || attemptNumber !== playbackAttempt || !wantsPlayback) return;
        if (playbackAttempt === 0) {
          playbackAttempt = 1;
          audio.load();
          startPlaybackAttempt(requestVersion);
          return;
        }
        markPlaybackUnavailable(requestVersion);
      }, connectionTimeoutMs);
      const playPromise = audio.play();
      if (playPromise?.catch) {
        playPromise.catch(() => {
          if (requestVersion !== playbackRequestVersion || attemptNumber !== playbackAttempt || !wantsPlayback) return;
          if (playbackAttempt === 0) {
            playbackAttempt = 1;
            audio.load();
            startPlaybackAttempt(requestVersion);
            return;
          }
          markPlaybackUnavailable(requestVersion);
        });
      }
    }

    function requestPlayback() {
      if (!audio.getAttribute("src")) return;
      wantsPlayback = true;
      playbackAttempt = 0;
      playbackRequestVersion += 1;
      startPlaybackAttempt(playbackRequestVersion);
    }

    function cancelPlayback() {
      wantsPlayback = false;
      playbackRequestVersion += 1;
      clearConnectionTimer();
      audio.pause();
      setPlaybackState("ready");
    }

    function clearAudioStream() {
      wantsPlayback = false;
      playbackAttempt = 0;
      playbackRequestVersion += 1;
      clearConnectionTimer();
      audio.pause();
      globalObject.dispatchEvent(new CustomEvent("colt-radio-playback", { detail: { playing: false } }));
      audio.removeAttribute("src");
      audio.load();
      audio.hidden = true;
      nowPlaying.hidden = true;
      setPlaybackState("idle");
      nowPlayingTitle.textContent = "Loading track information...";
      if (metadataTimer) globalObject.clearInterval(metadataTimer);
      metadataTimer = 0;
    }

    function clearEmbeddedPlayer() {
      const activeFrame = iframe;
      activeFrame.src = "about:blank";
      activeFrame.remove();
      iframe = createPlayerFrame();
      playerWrap.insertBefore(iframe, nowPlaying);
    }

    function trackNameFromSource(source) {
      const filename = decodeURIComponent(source.split("/").pop() || "Lo-fi Hip Hop");
      return filename.replace(/\.mp3$/i, "");
    }

    function loadNextPlaylistTrack(station, { autoplay = false } = {}) {
      if (!station.sources?.length) return;
      let nextIndex = Math.floor(Math.random() * station.sources.length);
      if (station.sources.length > 1 && nextIndex === playlistTrackIndex) {
        nextIndex = (nextIndex + 1) % station.sources.length;
      }
      playlistTrackIndex = nextIndex;
      const source = station.sources[nextIndex];
      audio.src = source;
      nowPlayingTitle.textContent = `Purrple Cat - ${trackNameFromSource(source)}`;
      audio.load();
      if (autoplay) requestPlayback();
    }

    function metadataSources(payload) {
      const source = payload?.icestats?.source;
      return Array.isArray(source) ? source : source ? [source] : [];
    }

    async function refreshNowPlaying(station) {
      if (activeStation !== station.id) return;
      try {
        const metadataEndpoint = station.metadataEndpoint || (station.metadataMount ? "https://stream.nightride.fm/status-json.xsl" : "");
        if (!metadataEndpoint) {
          nowPlayingTitle.textContent = `${station.label} live stream`;
          return;
        }
        const response = await fetch(metadataEndpoint, {
          cache: "no-store",
          method: station.metadataMethod || "GET",
          headers: station.metadataHeaders,
          body: station.metadataBody
        });
        if (!response.ok) throw new Error("Metadata unavailable");
        const payload = station.metadataFormat === "plainText"
          ? await response.text()
          : await response.json();
        if (station.metadataFormat === "plainText") {
          const title = String(payload || "").trim();
          if (activeStation === station.id) nowPlayingTitle.textContent = title || `${station.label} live stream`;
          return;
        }
        if (station.metadataFormat === "onlineRadioBox") {
          const currentTrack = payload?.playlist?.[0]?.name;
          if (activeStation === station.id) nowPlayingTitle.textContent = currentTrack || `${station.label} live stream`;
          return;
        }
        if (station.metadataFormat === "samCloudNowPlaying") {
          const currentTrack = payload?.m_Item2;
          const title = [currentTrack?.Artist, currentTrack?.Title].filter(Boolean).join(" - ");
          if (activeStation === station.id) nowPlayingTitle.textContent = title || `${station.label} live stream`;
          return;
        }
        if (station.metadataFormat === "azuraNowPlaying") {
          const currentTrack = payload?.now_playing?.song;
          const title = [currentTrack?.artist, currentTrack?.title].filter(Boolean).join(" - ") || currentTrack?.text;
          if (activeStation === station.id) nowPlayingTitle.textContent = title || `${station.label} live stream`;
          return;
        }
        if (station.metadataFormat === "simpleTrack") {
          const title = [payload?.artist, payload?.title || payload?.song].filter(Boolean).join(" - ");
          if (activeStation === station.id) nowPlayingTitle.textContent = title || `${station.label} live stream`;
          return;
        }
        const stream = metadataSources(payload).find(item => {
          try {
            return new URL(item.listenurl).pathname === station.metadataMount;
          } catch (error) {
            return String(item.listenurl || "").endsWith(station.metadataMount);
          }
        });
        if (activeStation !== station.id) return;
        nowPlayingTitle.textContent = stream?.title || stream?.["display-title"] || `${station.label} live stream`;
      } catch (error) {
        if (activeStation === station.id) nowPlayingTitle.textContent = `${station.label} live stream`;
      }
    }

    function startNowPlayingUpdates(station) {
      refreshNowPlaying(station);
      metadataTimer = globalObject.setInterval(() => refreshNowPlaying(station), 20000);
    }

    function updateStreamLabel(station) {
      const provider = station.provider || (station.type === "playlist" ? "Lo-fi Hip Hop" : "Nightride FM");
      nowPlayingLabel.textContent = `${station.label} \u00b7 ${provider}`;
    }

    function setLauncherState() {
      launcherLabel.textContent = activeStation ? "Colt Radio • On" : "Colt Radio";
      launcher.classList.toggle("is-playing", Boolean(activeStation));
    }

    function minimizePanel({ focusLauncher = true } = {}) {
      panel.hidden = true;
      launcher.hidden = false;
      launcher.setAttribute("aria-expanded", "false");
      if (focusLauncher && !root.hidden) launcher.focus();
    }

    function stopRadio({ focusLauncher = true } = {}) {
      clearAudioStream();
      clearEmbeddedPlayer();
      placeholder.hidden = false;
      activeStation = "";
      stationButtons.forEach(button => {
        button.classList.remove("is-active");
        button.setAttribute("aria-pressed", "false");
      });
      setLauncherState();
      minimizePanel({ focusLauncher });
    }

    function selectStation(stationId) {
      const station = stations.find(item => item.id === stationId);
      if (!station) return;
      activeStation = station.id;
      clearAudioStream();
      clearEmbeddedPlayer();
      if (station.type === "embed") {
        iframe.src = station.source;
        iframe.title = `Lofi Cafe ${station.label} station`;
        iframe.hidden = false;
      } else if (station.type === "playlist") {
        audio.setAttribute("aria-label", `${station.label} station audio controls`);
        audio.hidden = false;
        nowPlaying.hidden = false;
        updateStreamLabel(station);
        loadNextPlaylistTrack(station);
        setPlaybackState("ready");
      } else {
        audio.src = station.source;
        audio.setAttribute("aria-label", `${station.label} station audio controls`);
        audio.hidden = false;
        nowPlaying.hidden = false;
        updateStreamLabel(station);
        audio.load();
        setPlaybackState("ready");
        startNowPlayingUpdates(station);
      }
      placeholder.hidden = true;
      note.textContent = station.note;
      stationButtons.forEach(button => {
        const selected = button.dataset.station === station.id;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
      rememberStation(station.id);
      setLauncherState();
    }

    function openPanel() {
      if (!headingHorse.src) headingHorse.src = headingHorse.dataset.src;
      if (!streamArtworkImage.src) streamArtworkImage.src = streamArtworkImage.dataset.src;
      panel.hidden = false;
      launcher.hidden = true;
      launcher.setAttribute("aria-expanded", "true");
      globalObject.dispatchEvent(new CustomEvent("colt-radio-opened"));
      if (!activeStation) selectStation(preferredStation());
      stationButtons.find(button => button.dataset.station === activeStation)?.focus();
    }

    function updateVisibility(event) {
      const screen = event?.detail?.screen || "home";
      syncFavorites(event?.detail?.auth);
      const shouldHide = hiddenScreens.has(screen);
      root.hidden = shouldHide;
      root.classList.toggle("has-class-timer", Boolean(document.querySelector(".class-timer-badge")));
      if (screen === "coltRun") {
        stopRadio({ focusLauncher: false });
        return;
      }
      if (shouldHide) minimizePanel({ focusLauncher: false });
    }

    launcher.addEventListener("click", openPanel);
    minimize.addEventListener("click", () => minimizePanel());
    stop.addEventListener("click", () => stopRadio());
    stationFilters.addEventListener("click", event => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      favoritesOnly = button.dataset.filter === "favorites";
      renderFavorites();
      const firstVisibleStation = stationNav.querySelector("[data-station-item]:not([hidden]) .colt-radio-station");
      firstVisibleStation?.focus();
    });
    stationNav.addEventListener("click", event => {
      const favoriteButton = event.target.closest("[data-favorite-station]");
      if (favoriteButton) {
        toggleFavorite(favoriteButton.dataset.favoriteStation);
        return;
      }
      const button = event.target.closest("[data-station]");
      if (button) selectStation(button.dataset.station);
    });
    audio.addEventListener("ended", () => {
      const station = stations.find(item => item.id === activeStation);
      if (station?.type === "playlist") loadNextPlaylistTrack(station, { autoplay: true });
    });
    audio.addEventListener("play", () => {
      if (wantsPlayback) setPlaybackState(playbackAttempt ? "retrying" : "connecting");
    });
    audio.addEventListener("playing", () => {
      if (!wantsPlayback) return;
      clearConnectionTimer();
      playbackAttempt = 0;
      setPlaybackState("playing");
      globalObject.dispatchEvent(new CustomEvent("colt-radio-playback", {
        detail: { playing: true, station: activeStation }
      }));
    });
    audio.addEventListener("pause", () => {
      globalObject.dispatchEvent(new CustomEvent("colt-radio-playback", { detail: { playing: false } }));
      if (suppressPauseState) return;
      if (wantsPlayback) setPlaybackState("buffering");
      else if (nowPlaying.dataset.playbackState !== "error") setPlaybackState("ready");
    });
    audio.addEventListener("canplay", () => {
      if (!wantsPlayback && nowPlaying.dataset.playbackState !== "error") setPlaybackState("ready");
    });
    ["waiting", "stalled"].forEach(eventName => audio.addEventListener(eventName, () => {
      if (!wantsPlayback) return;
      setPlaybackState("buffering");
      clearConnectionTimer();
      const requestVersion = playbackRequestVersion;
      const attemptNumber = playbackAttempt;
      connectionTimer = globalObject.setTimeout(() => {
        if (requestVersion !== playbackRequestVersion || attemptNumber !== playbackAttempt || !wantsPlayback) return;
        if (playbackAttempt === 0) {
          playbackAttempt = 1;
          audio.load();
          startPlaybackAttempt(requestVersion);
          return;
        }
        markPlaybackUnavailable(requestVersion);
      }, connectionTimeoutMs);
    }));
    audio.addEventListener("error", () => {
      if (!wantsPlayback) return;
      const requestVersion = playbackRequestVersion;
      if (playbackAttempt === 0) {
        playbackAttempt = 1;
        audio.load();
        startPlaybackAttempt(requestVersion);
        return;
      }
      markPlaybackUnavailable(requestVersion);
    });
    toggleStream.addEventListener("click", () => {
      if (wantsPlayback || !audio.paused) cancelPlayback();
      else requestPlayback();
    });
    volumeSlider.addEventListener("input", () => setVolume(volumeSlider.value));
    muteStream.addEventListener("click", () => {
      const selectedVolume = Number(volumeSlider.value);
      if (audio.muted && selectedVolume > 0) {
        setVolume(selectedVolume, { remember: false });
      } else if (audio.muted) {
        setVolume(65);
      } else {
        audio.muted = true;
        muteStream.innerHTML = volumeIconSvg(selectedVolume, true);
        muteStream.setAttribute("aria-label", "Unmute Colt Radio");
      }
    });
    panel.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        event.preventDefault();
        minimizePanel();
      }
    });
    globalObject.addEventListener("colt-assistant-opened", () => minimizePanel({ focusLauncher: false }));
    globalObject.addEventListener("colt-run-opening", () => stopRadio({ focusLauncher: false }));
    globalObject.addEventListener("classroom-launchpad-rendered", updateVisibility);

    updateVisibility({ detail: { screen: "home" } });
    renderFavorites();
    setLauncherState();
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountRadio);
    else mountRadio();
  }
})(typeof window !== "undefined" ? window : globalThis);

import React, { useState } from 'react';
import { 
  X, MapPin, Search, Navigation, Building2, Coffee, 
  HeartPulse, UtensilsCrossed, Info, Layers, Compass, ArrowRight,
  GraduationCap, UserCheck, ChevronDown, ChevronUp, Mail, Building
} from 'lucide-react';

export default function CampusMapModal({ isOpen, onClose, onAskAboutPlace }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'academic', 'food', 'facilities', 'faculty'
  const [expandedCardId, setExpandedCardId] = useState(null);

  if (!isOpen) return null;

  // -----------------------------------------------------------
  // Room Number Parser & Strict Locator Logic
  // -----------------------------------------------------------
  const parseRoomNumber = (query) => {
    const cleaned = query.trim().toUpperCase().replace(/\s+/g, '');
    if (!cleaned) return null;

    const match = cleaned.match(/^([AB])([A-D])(\d{2,4})$/);
    if (!match) return null;

    const buildingCode = match[1];
    const floorLetter = match[2];
    const digits = match[3];
    const floorDigit = digits[0];

    const letterToDigit = {
      'A': '1',
      'B': '2',
      'C': '3',
      'D': '4'
    };

    // Check validity
    if (floorDigit !== letterToDigit[floorLetter]) {
      return {
        type: 'invalid',
        roomCode: cleaned,
        error: `${cleaned} is an INVALID room number. Floor letter '${floorLetter}' and number '${floorDigit}' do not match.`
      };
    }

    if (buildingCode === 'A') {
      const floors = {
        'A': 'Ground Floor',
        'B': 'First Floor',
        'C': 'Second Floor',
        'D': 'Third Floor'
      };
      return {
        type: 'room',
        buildingId: 'old-academic',
        buildingName: 'Old Academic Block (Block A)',
        roomCode: cleaned,
        floor: floors[floorLetter],
      };
    } else {
      const floors = {
        'A': 'Basement Floor',
        'B': 'Ground Floor',
        'C': 'First Floor',
        'D': 'Second Floor'
      };
      return {
        type: 'room',
        buildingId: 'new-academic',
        buildingName: 'New Academic Block (Block B)',
        roomCode: cleaned,
        floor: floors[floorLetter],
      };
    }
  };

  const roomLookup = parseRoomNumber(searchQuery);

  // -----------------------------------------------------------
  // Faculty Directory Data (from iiitkottayam.ac.in/#!/faculty)
  // -----------------------------------------------------------
  const facultyMembers = [
    {
      name: "Dr. Ebin Deni Raj",
      role: "Associate Dean & Associate Professor",
      dept: "Computer Science & Engineering",
      cabin: "AC 308 (Second Floor) / AA 117 (Ground Floor)",
      block: "Old Academic Block (Block A)"
    },
    {
      name: "Dr. Christina Terese Joseph",
      role: "HOD (CSE-1) & Assistant Professor",
      dept: "Computer Science & Engineering",
      cabin: "AA 108 (Ground Floor) / AC 318 (Second Floor)",
      block: "Old Academic Block (Block A)"
    },
    {
      name: "Dr. Rubell Marion Lincy G.",
      role: "HOD (CSE-2) & Assistant Professor",
      dept: "Computer Science & Engineering",
      cabin: "BC 317 (First Floor, Block B) / AB 219 (First Floor, Block A)",
      block: "New & Old Academic Blocks"
    },
    {
      name: "Dr. Arun Cyril Jose",
      role: "HOD (Cyber Security) & Assistant Professor",
      dept: "Computer Science & Engineering",
      cabin: "AB 213 (First Floor) / AA 122 (Ground Floor)",
      block: "Old Academic Block (Block A)"
    },
    {
      name: "Dr. Della Thomas",
      role: "Assistant Professor",
      dept: "Computer Science & Engineering",
      cabin: "BC 313 (First Floor)",
      block: "New Academic Block (Block B)"
    },
    {
      name: "Dr. Manu Madhavan",
      role: "Assistant Professor",
      dept: "Computer Science & Engineering",
      cabin: "BC 307 (First Floor)",
      block: "New Academic Block (Block B)"
    },
    {
      name: "Dr. P. Victer Paul",
      role: "Assistant Professor",
      dept: "Computer Science & Engineering",
      cabin: "AC 312 (Second Floor)",
      block: "Old Academic Block (Block A)"
    },
    {
      name: "Dr. Balasubramanian P.",
      role: "Assistant Professor",
      dept: "Computer Science & Engineering",
      cabin: "BD 408 (Second Floor)",
      block: "New Academic Block (Block B)"
    },
    {
      name: "Dr. Dhakshayani J.",
      role: "Assistant Professor",
      dept: "Computer Science & Engineering",
      cabin: "AB 209 F (First Floor)",
      block: "Old Academic Block (Block A)"
    },
    {
      name: "Dr. Jeena Thomas",
      role: "Assistant Professor",
      dept: "Computer Science & Engineering",
      cabin: "BA 101 C (Basement Floor)",
      block: "New Academic Block (Block B)"
    },
    {
      name: "Dr. S. Jai Ganesh",
      role: "Assistant Professor",
      dept: "Computer Science & Engineering",
      cabin: "AC 304 A (Second Floor)",
      block: "Old Academic Block (Block A)"
    },
    {
      name: "Dr. Sivaiah Bellamkonda",
      role: "Assistant Professor",
      dept: "Computer Science & Engineering",
      cabin: "AA 104 (Ground Floor)",
      block: "Old Academic Block (Block A)"
    },
    {
      name: "Dr. J. V. Bibal Benifa",
      role: "Associate Dean & Assistant Professor",
      dept: "Computer Science & Engineering",
      cabin: "AA 113 (Ground Floor) / AB 216 (First Floor)",
      block: "Old Academic Block (Block A)"
    },
    {
      name: "Dr. Panchami V.",
      role: "Associate Dean & Assistant Professor",
      dept: "Computer Science & Engineering",
      cabin: "BD 416 (Second Floor, Block B) / AB 218 (First Floor, Block A)",
      block: "New & Old Academic Blocks"
    },
    {
      name: "Dr. Bakkyaraj T.",
      role: "Associate Dean & Assistant Professor",
      dept: "Computer Science & Engineering",
      cabin: "AB 212 (First Floor) / AA 118 (Ground Floor)",
      block: "Old Academic Block (Block A)"
    },
    {
      name: "Dr. Koppala Guravaiah",
      role: "Assistant Professor",
      dept: "Computer Science & Engineering",
      cabin: "AA 105 (Ground Floor)",
      block: "Old Academic Block (Block A)"
    },
    {
      name: "Dr. Ananth A.",
      role: "HOD (ECE) & Assistant Professor",
      dept: "Electronics & Communication Engineering",
      cabin: "AB 208 (First Floor) / AC 313 (Second Floor)",
      block: "Old Academic Block (Block A)"
    },
    {
      name: "Dr. Ragesh G. K.",
      role: "Associate Dean & Assistant Professor",
      dept: "Electronics & Communication Engineering",
      cabin: "CAB 103 B",
      block: "Faculty Cabin Wing"
    },
    {
      name: "Dr. Vengadeswaran S.",
      role: "Assistant Professor",
      dept: "Electronics & Communication Engineering",
      cabin: "BB 210 (Ground Floor)",
      block: "New Academic Block (Block B)"
    },
    {
      name: "Dr. Sridhar Raj S.",
      role: "Assistant Professor",
      dept: "Electronics & Communication Engineering",
      cabin: "AC 317 (Second Floor)",
      block: "Old Academic Block (Block A)"
    },
    {
      name: "Dr. Kala S.",
      role: "Assistant Professor",
      dept: "Electronics & Communication Engineering",
      cabin: "ECE Faculty Department Wing",
      block: "Old Academic Block"
    },
    {
      name: "Dr. Bini A. A.",
      role: "Assistant Professor",
      dept: "Electronics & Communication Engineering",
      cabin: "ECE Faculty Department Wing",
      block: "Old Academic Block"
    },
    {
      name: "Dr. K. Suriyapriya",
      role: "Assistant Professor",
      dept: "Electronics & Communication Engineering",
      cabin: "ECE Faculty Department Wing",
      block: "Old Academic Block"
    },
    {
      name: "Dr. Dhanyamol M. V.",
      role: "HOD (CSH) & Assistant Professor",
      dept: "Computational Science & Humanities",
      cabin: "BC 316 (First Floor, Block B) / AA 119 (Ground Floor, Block A)",
      block: "New & Old Academic Blocks"
    },
    {
      name: "Dr. Divya Sindhu Lekha",
      role: "Associate Dean & Assistant Professor",
      dept: "Computational Science & Humanities (Mathematics)",
      cabin: "BD 417 (Second Floor, Block B) / AA 116 (Ground Floor, Block A)",
      block: "New & Old Academic Blocks"
    },
    {
      name: "Dr. Krishnendhu S. P.",
      role: "Assistant Professor",
      dept: "Computational Science & Humanities",
      cabin: "AA 107 (Ground Floor)",
      block: "Old Academic Block (Block A)"
    },
    {
      name: "Prof. Ashok S.",
      role: "Adjunct Professor",
      dept: "Electronics & Communication Engineering",
      cabin: "AC 307 (Second Floor)",
      block: "Old Academic Block (Block A)"
    },
    {
      name: "Dr. Riyasudheen T. K.",
      role: "Chief Vigilance Officer (CVO) & Assistant Professor",
      dept: "Computational Science & Humanities",
      cabin: "BD 412 (Second Floor)",
      block: "New Academic Block (Block B)"
    },
    {
      name: "CyberLabs Research Centre",
      role: "Innovation & Research Lab",
      dept: "Cyber Security & AI",
      cabin: "BD 415 (Second Floor)",
      block: "New Academic Block (Block B)"
    }
  ];

  // -----------------------------------------------------------
  // Campus Points of Interest Data
  // -----------------------------------------------------------
  const campusLocations = [
    {
      id: 'admin',
      name: 'Admin Block',
      category: 'academic',
      tag: 'Main Offices',
      icon: <Building2 className="text-blue-400" size={20} />,
      color: '#3b82f6',
      description: 'Houses Directorate, Registrar, Dean Offices, Academic Section, Accounts & Admission Helpdesk.',
      locationDetail: 'Front area of the central campus',
      highlights: ['Director Office', 'Accounts & Fees Desk', 'Faculty & Admin Rooms']
    },
    {
      id: 'new-academic',
      name: 'New Academic Block (Block B)',
      category: 'academic',
      tag: 'Classrooms & Labs',
      icon: <Building2 className="text-indigo-400" size={20} />,
      color: '#6366f1',
      description: 'Main multi-storey academic complex. All rooms start with "B" (e.g. BA101, BC304). Features basement lecture halls.',
      locationDetail: 'Connected via walkway from Admin & Milma area',
      floorScheme: [
        { code: 'BA / B1xx', floor: 'Basement Floor (e.g., BA101)' },
        { code: 'BB / B2xx', floor: 'Ground Floor (Scoops & Medical Room)' },
        { code: 'BC / B3xx', floor: 'First Floor (e.g., BC304, Lecture Halls)' },
        { code: 'BD / B4xx', floor: 'Second Floor (Computer Labs & Faculty)' },
      ],
      highlights: ['Scoops Snack Shop (Ground Floor)', 'Medical Room (Ground Floor)', 'Smart Lecture Theatres']
    },
    {
      id: 'old-academic',
      name: 'Old Academic Block (Block A)',
      category: 'academic',
      tag: 'Classrooms & Depts',
      icon: <Building2 className="text-sky-400" size={20} />,
      color: '#0ea5e9',
      description: 'Original academic facility. All rooms start with "A" (e.g. AA101, AC301).',
      locationDetail: 'Situated near the student Mess area',
      floorScheme: [
        { code: 'AA / A1xx', floor: 'Ground Floor (e.g., AA101)' },
        { code: 'AB / A2xx', floor: 'First Floor' },
        { code: 'AC / A3xx', floor: 'Second Floor (e.g., AC301)' },
      ],
      highlights: ['Main Classrooms', 'Department Laboratories', 'Near Student Mess']
    },
    {
      id: 'scoops',
      name: 'Scoops Snack Shop',
      category: 'food',
      tag: 'Snacks & Ice Cream',
      icon: <Coffee className="text-amber-400" size={20} />,
      color: '#f59e0b',
      description: 'Popular campus snack spot serving beverages, fresh juices, quick bites, and ice creams.',
      locationDetail: 'Located on the Ground Floor of New Academic Block (Block B)',
      highlights: ['Ground Floor Block B', 'Right beside the Medical Room']
    },
    {
      id: 'medical-room',
      name: 'Medical Room (Health Centre)',
      category: 'facilities',
      tag: 'First Aid & Health',
      icon: <HeartPulse className="text-rose-400" size={20} />,
      color: '#f43f5e',
      description: 'Campus first-aid station with basic medical supplies, resting beds, and emergency support.',
      locationDetail: 'Ground Floor of New Academic Block, right beside Scoops snack shop.',
      highlights: ['Adjacent to Scoops', 'Doctor / Nurse visits on schedule']
    },
    {
      id: 'milma',
      name: 'Milma Refreshment Stall',
      category: 'food',
      tag: 'Dairy & Beverages',
      icon: <Coffee className="text-emerald-400" size={20} />,
      color: '#10b981',
      description: 'Famous campus spot for hot tea, coffee, milk shakes, snacks, and bakery items.',
      locationDetail: 'On the main walkway connecting Old Academic to New Academic, behind Admin Block.',
      highlights: ['Between Old & New Academic Blocks', 'Behind Admin Block']
    },
    {
      id: 'mess',
      name: 'Student Dining Mess',
      category: 'food',
      tag: 'Central Dining',
      icon: <UtensilsCrossed className="text-orange-400" size={20} />,
      color: '#ea580c',
      description: 'Central dining facility for all hostel residents serving breakfast, lunch, snacks, and dinner.',
      locationDetail: 'Situated directly behind the Old Academic Block (Block A)',
      highlights: ['Behind Old Academic Block', 'Close to Millet Stall']
    },
    {
      id: 'millet',
      name: 'Millet Food Stall',
      category: 'food',
      tag: 'Healthy Snacks',
      icon: <UtensilsCrossed className="text-lime-400" size={20} />,
      color: '#84cc16',
      description: 'Nutritious millet-based snacks, healthy dishes, and traditional refreshments.',
      locationDetail: 'Located right next to the Student Mess area.',
      highlights: ['Near the Mess', 'Behind Old Academic Block']
    }
  ];

  const filteredLocations = campusLocations.filter(loc => {
    const matchesCategory = activeTab === 'all' || loc.category === activeTab;
    const matchesSearch = !searchQuery || 
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.locationDetail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredFaculties = facultyMembers.filter(fac => {
    return !searchQuery || 
      fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.cabin.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="modal-backdrop">
      <div className="campus-modal-container">
        {/* Modal Header */}
        <div className="campus-modal-header">
          <div className="campus-header-left">
            <div className="campus-header-icon">
              <Compass size={24} />
            </div>
            <div>
              <h2 className="campus-header-title">
                IIIT Kottayam Campus Map &amp; Directory
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="btn-icon"
            aria-label="Close campus map"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Room Decoder Bar */}
        <div className="campus-search-section">
          <div className="search-input-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text"
              placeholder="Search faculty (Dr. Ebin, Dr. Della), room (BC304, AA101), or place (Scoops, Milma)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="map-search-input"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="search-clear-btn"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Room Decoding Card */}
          {roomLookup && (
            <div className={`room-decoder-banner ${roomLookup.type === 'invalid' ? 'invalid' : ''}`}>
              {roomLookup.type === 'invalid' ? (
                <div>
                  <div className="room-decoder-header error">
                    ⚠️ <span>Invalid Room Number:</span>
                  </div>
                  <div className="room-decoder-detail error-desc">
                    {roomLookup.error}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="room-decoder-header">
                    <MapPin size={16} />
                    <span>Room {roomLookup.roomCode} Found:</span>
                  </div>
                  <div className="room-decoder-detail">
                    🏢 <strong>{roomLookup.buildingName}</strong> &bull; 📍 <strong>{roomLookup.floor}</strong>
                  </div>
                  <div className="room-decoder-directions">
                    🧭 <strong>Walking Route:</strong> Enter {roomLookup.buildingName.includes('Block A') ? 'Old Academic (Block A)' : 'New Academic (Block B)'} &bull; Proceed to {roomLookup.floor} &bull; Room {roomLookup.roomCode}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content Body: Visual Blueprint & Location/Faculty Cards */}
        <div className="campus-modal-body">
          {/* Left Column: Visual Campus Layout & Flow */}
          <div className="campus-blueprint-card">
            <div className="blueprint-header">
              <span className="blueprint-title">
                <Layers size={14} style={{ color: '#60a5fa' }} />
                CAMPUS ARCHITECTURAL SCHEME
              </span>
              <span className="blueprint-badge">
                Ground &amp; Basement Mapping
              </span>
            </div>

            {/* Interactive Blueprint Representing Campus Blocks & Connections */}
            <div className="campus-diagram-wrapper">
              <div className="campus-node-grid">
                {/* Admin Block */}
                <div 
                  className={`campus-block-node ${selectedLocation?.id === 'admin' ? 'active-node' : ''}`}
                  onClick={() => setSelectedLocation(campusLocations.find(l => l.id === 'admin'))}
                >
                  <div className="node-icon bg-blue-500/20 text-blue-400">🏛️</div>
                  <div className="node-info">
                    <h4>Admin Block</h4>
                    <span>Directorate &amp; Accounts</span>
                  </div>
                </div>

                {/* Connector Path with Milma */}
                <div 
                  className={`campus-path-node ${selectedLocation?.id === 'milma' ? 'active-node' : ''}`}
                  onClick={() => setSelectedLocation(campusLocations.find(l => l.id === 'milma'))}
                >
                  <span className="path-line"></span>
                  <div className="milma-chip">🥛 Milma Stall (Behind Admin)</div>
                  <span className="path-line"></span>
                </div>

                {/* Old & New Academic Blocks Side by Side */}
                <div className="academic-blocks-row">
                  {/* Old Academic Block */}
                  <div 
                    className={`campus-block-node academic-node ${selectedLocation?.id === 'old-academic' || roomLookup?.buildingId === 'old-academic' ? 'active-node' : ''}`}
                    onClick={() => {
                      const loc = campusLocations.find(l => l.id === 'old-academic');
                      setSelectedLocation(loc);
                      setExpandedCardId('old-academic');
                    }}
                  >
                    <div className="node-icon bg-sky-500/20 text-sky-400">🏫</div>
                    <div className="node-info">
                      <h4>Old Academic (Block A)</h4>
                      <span>Classrooms &amp; Faculty Cabins</span>
                    </div>
                  </div>

                  {/* New Academic Block */}
                  <div 
                    className={`campus-block-node academic-node ${selectedLocation?.id === 'new-academic' || roomLookup?.buildingId === 'new-academic' ? 'active-node' : ''}`}
                    onClick={() => {
                      const loc = campusLocations.find(l => l.id === 'new-academic');
                      setSelectedLocation(loc);
                      setExpandedCardId('new-academic');
                    }}
                  >
                    <div className="node-icon bg-indigo-500/20 text-indigo-400">🏢</div>
                    <div className="node-info">
                      <h4>New Academic (Block B)</h4>
                      <span>Classrooms &amp; Laboratories</span>
                    </div>
                  </div>
                </div>

                {/* Connector Path to Mess */}
                <div className="mess-path-indicator">
                  <div className="text-[11px] text-slate-400 text-center mb-1">Behind Old Academic:</div>
                  <div className="flex gap-2 justify-center">
                    <div 
                      className={`campus-block-node small-node ${selectedLocation?.id === 'mess' ? 'active-node' : ''}`}
                      onClick={() => setSelectedLocation(campusLocations.find(l => l.id === 'mess'))}
                    >
                      <div className="node-icon bg-orange-500/20 text-orange-400">🍽️</div>
                      <div className="node-info">
                        <h4>Student Mess</h4>
                        <span>Dining Area</span>
                      </div>
                    </div>

                    <div 
                      className={`campus-block-node small-node ${selectedLocation?.id === 'millet' ? 'active-node' : ''}`}
                      onClick={() => setSelectedLocation(campusLocations.find(l => l.id === 'millet'))}
                    >
                      <div className="node-icon bg-lime-500/20 text-lime-400">🌾</div>
                      <div className="node-info">
                        <h4>Millet Stall</h4>
                        <span>Healthy Food</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Floor Rule Card */}
            <div className="rule-cheatsheet">
              <div className="rule-cheatsheet-title">
                💡 Room &amp; Floor Decoding:
              </div>
              <ul className="rule-cheatsheet-list">
                <li>&bull; <strong style={{ color: '#ffffff' }}>Old Academic (A):</strong> <code>AA1xx</code> = Ground Floor, <code>AB2xx</code> = 1st Floor, <code>AC3xx</code> = 2nd Floor.</li>
                <li>&bull; <strong style={{ color: '#ffffff' }}>New Academic (B):</strong> <code>BA1xx</code> = Basement, <code>BB2xx</code> = Ground, <code>BC3xx</code> = 1st Floor, <code>BD4xx</code> = 2nd Floor.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Location Details & Filter List */}
          <div className="campus-places-list">
            {/* Category Filter Tabs */}
            <div className="category-tab-row">
              <button 
                className={`category-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Places
              </button>
              <button 
                className={`category-tab-btn ${activeTab === 'faculty' ? 'active' : ''}`}
                onClick={() => setActiveTab('faculty')}
              >
                👨‍🏫 Faculty Cabins ({facultyMembers.length})
              </button>
              <button 
                className={`category-tab-btn ${activeTab === 'academic' ? 'active' : ''}`}
                onClick={() => setActiveTab('academic')}
              >
                Academic Blocks
              </button>
              <button 
                className={`category-tab-btn ${activeTab === 'food' ? 'active' : ''}`}
                onClick={() => setActiveTab('food')}
              >
                Food &amp; Snacks
              </button>
              <button 
                className={`category-tab-btn ${activeTab === 'facilities' ? 'active' : ''}`}
                onClick={() => setActiveTab('facilities')}
              >
                Amenities
              </button>
            </div>

            {/* List Content */}
            <div className="places-scrollable">
              {/* Show Faculty Tab */}
              {activeTab === 'faculty' ? (
                filteredFaculties.map((fac, idx) => {
                  const cardKey = `faculty-${idx}`;
                  const isExpanded = expandedCardId === cardKey;
                  return (
                    <div 
                      key={idx} 
                      className={`place-card ${isExpanded ? 'selected expanded' : ''}`}
                      onClick={() => setExpandedCardId(prev => prev === cardKey ? null : cardKey)}
                    >
                      <div className="place-card-top">
                        <div className="place-card-main">
                          <div className="place-icon-box faculty">
                            <GraduationCap size={18} />
                          </div>
                          <div>
                            <h3 className="place-title">{fac.name}</h3>
                            <span className="place-role">{fac.role}</span>
                          </div>
                        </div>
                        <div className="place-top-right">
                          <span className="place-tag">{fac.dept.split(' ')[0]}</span>
                          <span className="accordion-toggle-btn">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </span>
                        </div>
                      </div>

                      {/* Always show key cabin highlight */}
                      <div className="place-cabin-card">
                        <div className="place-cabin-text">
                          📍 <strong>Cabin / Office:</strong> <span className="place-cabin-code">{fac.cabin}</span>
                        </div>
                        <div className="place-cabin-block">
                          🏢 {fac.block}
                        </div>
                      </div>

                      {/* Expanded Full Details Inline */}
                      {isExpanded && (
                        <div className="place-expanded-details">
                          <div className="detail-row">
                            <span className="detail-label">Department:</span>
                            <span className="detail-value">{fac.dept}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Designation:</span>
                            <span className="detail-value">{fac.role}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Official Portal:</span>
                            <span className="detail-value">iiitkottayam.ac.in/#!/faculty</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Cabin Location:</span>
                            <span className="detail-value text-emerald-300">{fac.cabin} ({fac.block})</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                filteredLocations.map((loc) => {
                  const isSelected = selectedLocation?.id === loc.id;
                  const isExpanded = expandedCardId === loc.id || isSelected;
                  return (
                    <div 
                      key={loc.id}
                      className={`place-card ${isExpanded ? 'selected expanded' : ''}`}
                      onClick={() => {
                        setSelectedLocation(loc);
                        setExpandedCardId(prev => prev === loc.id ? null : loc.id);
                      }}
                    >
                      <div className="place-card-top">
                        <div className="place-card-main">
                          <div className="place-icon-box">
                            {loc.icon}
                          </div>
                          <div>
                            <h3 className="place-title">{loc.name}</h3>
                            <span className="place-detail-subtitle">{loc.locationDetail}</span>
                          </div>
                        </div>
                        <div className="place-top-right">
                          <span className="place-tag">{loc.tag}</span>
                          <span className="accordion-toggle-btn">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </span>
                        </div>
                      </div>

                      <p className="place-desc">
                        {loc.description}
                      </p>

                      {/* Floor scheme / detailed breakdown */}
                      {loc.floorScheme && isExpanded && (
                        <div className="floor-scheme-grid">
                          {loc.floorScheme.map((f, i) => (
                            <div key={i} className="floor-scheme-item">
                              <span className="floor-scheme-code">{f.code}:</span>
                              <span className="floor-scheme-name">{f.floor}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Expanded In-Place Metadata */}
                      {isExpanded && (
                        <div className="place-expanded-details">
                          <div className="detail-row">
                            <span className="detail-label">Campus Zone:</span>
                            <span className="detail-value">{loc.locationDetail}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Category:</span>
                            <span className="detail-value text-capitalize">{loc.tag} ({loc.category})</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

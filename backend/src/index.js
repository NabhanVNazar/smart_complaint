import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import { WebSocketServer } from 'ws';
import url from 'url';
import dotenv from 'dotenv'; // bcrypt is no longer used directly here
import jwt from 'jsonwebtoken';
import axios from 'axios';
import connectDB from './config/database.js';
// Assuming Authority model is created alongside others
import User from './models/User.js';
import Department from './models/Department.js';
import Complaint from './models/Complaint.js';

dotenv.config();

const app = express();
const server = http.createServer(app); // Create an HTTP server from the Express app
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000; // As per spec
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());
// Morgan is great for development
if (process.env.NODE_ENV === 'development') {
app.use(morgan('dev'));
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'backend', timestamp: new Date().toISOString() });
});

// Complaints routes
app.get('/api/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find().populate('userId', 'name email').populate('departmentId', 'departmentName');
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      // For simplicity, attaching the whole decoded payload.
      // In a real app, you'd fetch the user/department from DB.
      req.user = decoded;

      next();
    } catch (error) {
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};

app.post('/api/complaints', protect, async (req, res) => {
  try {
    if (req.user.type !== 'user') {
      return res.status(403).json({ error: 'Only users can file complaints.' });
    }

    const { text, location } = req.body; // Simplified as per new spec
    if (!text || !location) {
      return res.status(400).json({ error: 'text and location are required' });
    }

    // --- Call the Python AI Service ---
    const aiServiceUrl = 'http://localhost:5001/classify';
    const aiResponse = await axios.post(aiServiceUrl, { text, location });
    const { department, severity } = aiResponse.data;

    if (!department || !severity) {
      // Fallback if AI service fails
      return res.status(500).json({ error: 'AI service failed to classify complaint.' });
    }

    // Verify user exists before creating complaint
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const complaint = new Complaint({
      title: `Complaint regarding ${department}`, // Auto-generate a title
      description: text, // Mapping text to description
      location,
      department,
      severity,
      status: 'Pending',
      userId: req.user.id,
    });

    await complaint.save();

    res.status(201).json({
      message: `Your complaint has been forwarded to ${department}.`,
      department,
      severity,
      complaintId: complaint._id,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create complaint', details: error.message });
  }
});

app.put('/api/complaints/:id/status', protect, async (req, res) => {
  if (req.user.type !== 'department') {
    return res.status(403).json({ error: 'Access denied. Only department users can update status.' });
  }

  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['Pending', 'Resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    // --- Real-time Notification Logic ---
    if (complaint.userId && clients.has(complaint.userId.toString())) {
      const clientWs = clients.get(complaint.userId.toString());
      clientWs.send(JSON.stringify({ type: 'STATUS_UPDATE', payload: { complaintId: complaint._id, status } }));
    }

    complaint.status = status;
    await complaint.save();

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update complaint status.' });
  }
});

// Users routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const user = new User({
      name,
      email,
      phone,
      address,
      password,
      type: 'user'
    });

    await user.save();
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// --- Professional, Structured, and Dynamic Mock Data for India ---

const indianStatesAndUTs = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", 
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", 
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const districtsByState = {
    "Andaman and Nicobar Islands": ["Nicobar", "North and Middle Andaman", "South Andaman"],
    "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Nellore", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "YSR Kadapa"],
    "Arunachal Pradesh": ["Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang", "Kra Daadi", "Kurung Kumey", "Lohit", "Longding", "Lower Dibang Valley", "Lower Siang", "Lower Subansiri", "Namsai", "Pakke-Kessang", "Papum Pare", "Shi Yomi", "Siang", "Tawang", "Tirap", "Upper Siang", "Upper Subansiri", "West Kameng", "West Siang"],
    "Assam": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup Metropolitan", "Kamrup", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"],
    "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur (Bhabua)", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
    "Chandigarh": ["Chandigarh"],
    "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"],
    "Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli", "Daman", "Diu"],
    "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South East Delhi", "South West Delhi"],
    "Goa": ["North Goa", "South Goa"],
    "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
    "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
    "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
    "Jammu and Kashmir": ["Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"],
    "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahebganj", "Seraikela-Kharsawan", "Simdega", "West Singhbhum"],
    "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davangere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"],
    "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
    "Ladakh": ["Kargil", "Leh"],
    "Lakshadweep": ["Lakshadweep"],
    "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"],
    "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
    "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ribhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"],
    "Mizoram": ["Aizawl", "Champhai", "Hnahthial", "Khawzawl", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Serchhip"],
    "Nagaland": ["Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"],
    "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Keonjhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"],
    "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"],
    "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sangrur", "SAS Nagar (Mohali)", "Shaheed Bhagat Singh Nagar", "Sri Muktsar Sahib", "Tarn Taran"],
    "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
    "Sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
    "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kancheepuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupattur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
    "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Ranga Reddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal Rural", "Warangal Urban", "Yadadri Bhuvanagiri"],
    "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
    "Uttar Pradesh": ["Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Badaun", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Rae Bareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
    "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
    "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"],
    // Add other states and districts as needed to expand the demo
};

const departmentTemplates = {
    central: [
        { name: "Ministry of Home Affairs", email: "home@nic.in" },
        { name: "Ministry of Finance", email: "finance@nic.in" },
        { name: "Ministry of Defence", email: "mod@nic.in" },
        { name: "Ministry of Railways", email: "railways@nic.in" },
        { name: "Ministry of Health and Family Welfare", email: "health@nic.in" },
        { name: "Ministry of Road Transport and Highways", email: "morth@nic.in" },
        { name: "Ministry of Education", email: "education@nic.in" },
        { name: "Ministry of Environment, Forest and Climate Change", email: "moefcc@nic.in" },
        { name: "Ministry of Agriculture & Farmers Welfare", email: "agri@nic.in" },
        { name: "Ministry of Communications", email: "comms@nic.in" },
        { name: "Ministry of Consumer Affairs, Food and Public Distribution", email: "consumeraffairs@nic.in" },
        { name: "Ministry of Corporate Affairs", email: "mca@nic.in" },
        { name: "Ministry of Culture", email: "culture@nic.in" },
        { name: "Ministry of Tourism", email: "tourism@nic.in" },
        { name: "Ministry of Women and Child Development", email: "wcd@nic.in" },
    ],
    state: [
        { name: "Public Works Department", email: "pwd" },
        { name: "Department of Revenue", email: "revenue" },
        { name: "State Police", email: "police" },
        { name: "State Transport", email: "transport" },
        { name: "State Water Supply", email: "water" },
        { name: "State Electricity Board", email: "power" },
        { name: "State Health Department", email: "health" },
        { name: "State Education Department", email: "education" },
        { name: "Department of Agriculture", email: "agri" },
        { name: "Department of Social Justice and Empowerment", email: "socialjustice" },
        { name: "Department of Tourism", email: "tourism" },
        { name: "Department of Labour", email: "labour" },
        { name: "Department of Forest and Wildlife", email: "forest" },
        { name: "Department of Housing and Urban Development", email: "housing" },
    ],
    district: [
        { name: "District Collector's Office", email: "collector" },
        { name: "Municipal Corporation", email: "mc" },
        { name: "District Health Office", email: "health" },
        { name: "District Education Office", email: "edu" },
        { name: "District Police", email: "police" },
        { name: "District Waste Management", email: "waste" },
        { name: "District Social Welfare Office", email: "socialwelfare" },
        { name: "District Agriculture Office", email: "agri" },
        { name: "District Labour Office", email: "labour" },
        { name: "District Sports Office", email: "sports" },
        { name: "District Food and Civil Supplies", email: "foodsupply" },
    ]
};

// --- New Location Endpoints ---
app.get('/api/locations/states', (req, res) => {
  res.json(indianStatesAndUTs);
});

app.get('/api/locations/districts', (req, res) => {
  const { state } = req.query;
  if (!state) {
    return res.status(400).json({ error: 'State query parameter is required.' });
  }
  res.json(districtsByState[state] || []);
});

// GET /api/departments/authorities
app.get('/api/departments/authorities', (req, res) => {
  const { level, state, district } = req.query;
  let generatedAuthorities = [];

  if (level === 'central') {
    generatedAuthorities = departmentTemplates.central.map(dept => ({
      id: `central-${dept.email.split('@')[0]}`,
      name: `${dept.name} (Delhi)`,
      email: dept.email,
    }));
  } else if (level === 'state' && state && indianStatesAndUTs.includes(state)) {
    const stateCode = state.substring(0, 3).toLowerCase();
    generatedAuthorities = departmentTemplates.state.map(dept => ({
      id: `state-${stateCode}-${dept.email}`,
      name: `${dept.name} (${state})`,
      email: `${dept.email}@${stateCode}.gov.in`,
    }));
  } else if (level === 'district' && state && district && indianStatesAndUTs.includes(state) && (districtsByState[state] || []).includes(district)) {
    const stateCode = state.substring(0, 3).toLowerCase();
    const distCode = district.substring(0, 3).toLowerCase();
    generatedAuthorities = departmentTemplates.district.map(dept => ({
      id: `dist-${stateCode}-${distCode}-${dept.email}`,
      name: `${dept.name} (${district})`,
      email: `${dept.email}@${distCode}.${stateCode}.gov.in`,
    }));
  }

  res.json(generatedAuthorities);
});

// Departments routes
// This endpoint is now deprecated in favor of OTP flow.
// It can be removed or kept for admin purposes.
app.get('/api/departments', async (req, res) => {
  try {
    const departments = await Department.find().select('-password');
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// This endpoint is replaced by the OTP flow.
/*
app.post('/api/departments', async (req, res) => {
  try {
    const { departmentName, departmentType, email, phone, officerName, password } = req.body;
    if (!departmentName || !departmentType || !email || !phone || !officerName || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingDept = await Department.findOne({ email });
    if (existingDept) {
      return res.status(409).json({ error: 'Department already exists' });
    }

    const department = new Department({
      departmentName,
      departmentType,
      email,
      phone,
      officerName,
      password,
      type: 'department'
    });

    await department.save();
    const token = jwt.sign({ id: department._id, email: department.email, type: 'department' }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: department._id,
        name: department.departmentName,
        email: department.email,
        type: 'department'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create department' });
  }
});*/

// New Department Registration Flow
app.post('/api/departments/register', async (req, res) => {
  const { authorityId, phone } = req.body;
  // Basic validation
  if (!authorityId || !phone || !/^\+91[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ error: 'Valid authority ID and Indian phone number are required.' });
  }
  // In a real app, you'd generate and store/cache the OTP with an expiry.
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`OTP for phone ${phone} (Authority ID: ${authorityId}): ${otp}`);
  res.json({ message: 'OTP generated and logged to server console.' });
});

app.post('/api/departments/verify-otp', async (req, res) => {
  const { authorityId, phone, otp } = req.body;

  // --- Robust Authority Lookup ---
  // This logic correctly finds the authority details based on the complex ID.
  let authority = null;
  const [level, ...rest] = authorityId.split('-');

  if (level === 'central') {
    const deptTemplate = departmentTemplates.central.find(d => `central-${d.email.split('@')[0]}` === authorityId);
    if (deptTemplate) {
      authority = { name: `${deptTemplate.name} (Delhi)`, email: deptTemplate.email };
    }
  } else if (level === 'state') {
    const stateCode = rest[0];
    const emailPrefix = rest[1];
    const stateName = Object.keys(districtsByState).find(s => s.substring(0, 3).toLowerCase() === stateCode);
    const deptTemplate = departmentTemplates.state.find(d => d.email === emailPrefix);
    if (stateName && deptTemplate) {
      authority = { name: `${deptTemplate.name} (${stateName})`, email: `${deptTemplate.email}@${stateCode}.gov.in` };
    }
  } else if (level === 'district') {
    const stateCode = rest[0];
    const distCode = rest[1];
    const emailPrefix = rest[2];
    const stateName = Object.keys(districtsByState).find(s => s.substring(0, 3).toLowerCase() === stateCode);
    const districtName = (districtsByState[stateName] || []).find(d => d.substring(0, 3).toLowerCase() === distCode);
    const deptTemplate = departmentTemplates.district.find(d => d.email === emailPrefix);
    if (stateName && districtName && deptTemplate) {
      authority = { name: `${deptTemplate.name} (${districtName})`, email: `${deptTemplate.email}@${distCode}.${stateCode}.gov.in` };
    }
  }

  // In a real app, you'd verify the OTP against a stored value.
  // For this mock, any 6-digit OTP is accepted.
  if (!authority || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ error: 'Invalid OTP or authority.' });
  }

  // Create or find department user
  let departmentUser = await Department.findOne({ email: authority.email });
  if (!departmentUser) {
    // This part has a mismatch with the Department schema.
    // For the hackathon, we'll create a user with minimal required fields.
    // A real app would need a more detailed registration form.
    departmentUser = new Department({
      departmentName: authority.name,
      email: authority.email,
      phone: phone,
    });
    await departmentUser.save();
  } else {
    // Update phone if department user already exists and phone is different
    if (departmentUser.phone !== phone) {
      departmentUser.phone = phone;
      await departmentUser.save();
    }
  } 
  const token = jwt.sign({ id: departmentUser._id, email: departmentUser.email, type: 'department' }, JWT_SECRET, { expiresIn: '24h' });
  res.status(201).json({ token, user: { id: departmentUser._id, name: departmentUser.departmentName, email: departmentUser.email, type: 'department' } });
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email, type: 'user' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        type: 'user'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Department Login with OTP
app.post('/api/departments/login/generate-otp', async (req, res) => {
    const { email } = req.body;
    const department = await Department.findOne({ email });
    if (!department) {
        return res.status(404).json({ error: 'Department not found.' });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Login OTP for ${email}: ${otp}`);
    res.json({ message: 'OTP generated and logged to server console.' });
});

app.post('/api/departments/login/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    const department = await Department.findOne({ email });
    // Mock OTP verification
    if (!department || !/^\d{6}$/.test(otp)) {
        return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const token = jwt.sign({ id: department._id, email: department.email, type: 'department' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({
        message: 'Login successful',
        token,
        user: { id: department._id, name: department.departmentName, email: department.email, type: 'department' }
    });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const user = new User({
      name,
      email,
      phone,
      address,
      password,
      type: 'user'
    });

    await user.save();
    const token = jwt.sign({ id: user._id, email: user.email, type: 'user' }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, type: 'user' }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// New endpoint for department dashboard
app.get('/api/departments/complaints', protect, async (req, res) => {
  if (req.user.type !== 'department') {
    return res.status(403).json({ error: 'Access denied' });
  }
  try {
    const department = await Department.findById(req.user.id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5; // Let's show 5 per page
    const skip = (page - 1) * limit;

    const query = { department: department.departmentName };

    const totalComplaints = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .sort({ severity: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      complaints, page, totalPages: Math.ceil(totalComplaints / limit), totalComplaints
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// --- WebSocket Server Setup ---
const wss = new WebSocketServer({ server });
const clients = new Map(); // Stores active connections: Map<userId, WebSocket>

wss.on('connection', (ws, req) => {
  const parameters = new url.URL(req.url, `http://${req.headers.host}`).searchParams;
  const token = parameters.get('token');

  if (!token) {
    ws.close(1008, 'Token not provided');
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'user') {
      ws.close(1008, 'Only users can connect');
      return;
    }

    const userId = decoded.id;
    clients.set(userId, ws);
    console.log(`WebSocket client connected: ${userId}`);

    ws.on('close', () => {
      clients.delete(userId);
      console.log(`WebSocket client disconnected: ${userId}`);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${userId}:`, error);
    });

  } catch (error) {
    ws.close(1008, 'Invalid token');
  }
});

server.listen(PORT, () => { // Use server.listen instead of app.listen
  console.log(`Backend running on http://localhost:${PORT}`);
});

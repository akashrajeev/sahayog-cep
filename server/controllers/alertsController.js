import Alert from '../models/Alert.js';

// Get all active alerts
export const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ 
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    }).sort({ createdAt: -1 });

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    
    // Fallback to mock data with location information
    const mockAlerts = [
      {
        _id: '1',
        type: 'flood',
        severity: 'high',
        region: 'Kolkata, West Bengal',
        description: 'Severe flooding in low-lying areas due to heavy rainfall',
        location: { lat: 22.5726, lng: 88.3639, address: 'Kolkata, West Bengal' },
        affectedRadius: 8000,
        evacuationRequired: true,
        isActive: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        emergencyContacts: [
          { name: 'Kolkata Disaster Management', phone: '+91-33-2214-5555', role: 'Emergency Coordinator' }
        ]
      },
      {
        _id: '2',
        type: 'cyclone',
        severity: 'high',
        region: 'Odisha Coast',
        description: 'Cyclonic storm approaching coastal districts',
        location: { lat: 20.2961, lng: 85.8245, address: 'Bhubaneswar, Odisha' },
        affectedRadius: 15000,
        evacuationRequired: true,
        isActive: true,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        emergencyContacts: [
          { name: 'Odisha Emergency Response', phone: '+91-674-233-9999', role: 'State Coordinator' }
        ]
      },
      {
        _id: '3',
        type: 'landslide',
        severity: 'medium',
        region: 'Darjeeling Hills',
        description: 'Landslide risk due to continuous rainfall in hill areas',
        location: { lat: 27.0238, lng: 88.2663, address: 'Darjeeling, West Bengal' },
        affectedRadius: 5000,
        evacuationRequired: false,
        isActive: true,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        emergencyContacts: [
          { name: 'Hill Station Emergency', phone: '+91-354-225-4444', role: 'Local Coordinator' }
        ]
      },
      {
        _id: '4',
        type: 'heatwave',
        severity: 'medium',
        region: 'Delhi NCR',
        description: 'Extreme heat conditions, stay hydrated and avoid outdoor activities',
        location: { lat: 28.6139, lng: 77.2090, address: 'New Delhi' },
        affectedRadius: 25000,
        evacuationRequired: false,
        isActive: true,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        emergencyContacts: [
          { name: 'Delhi Health Emergency', phone: '+91-11-2333-7777', role: 'Health Coordinator' }
        ]
      }
    ];
    
    res.json(mockAlerts);
  }
};

// Create a new alert
export const createAlert = async (req, res) => {
  try {
    const alert = new Alert(req.body);
    const savedAlert = await alert.save();
    res.status(201).json(savedAlert);
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(400).json({ error: error.message });
  }
};

// Update an alert
export const updateAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAlert = await Alert.findByIdAndUpdate(id, req.body, { 
      new: true, 
      runValidators: true 
    });
    
    if (!updatedAlert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    res.json(updatedAlert);
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(400).json({ error: error.message });
  }
};

// Deactivate an alert
export const deactivateAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAlert = await Alert.findByIdAndUpdate(
      id, 
      { isActive: false }, 
      { new: true }
    );
    
    if (!updatedAlert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    res.json({ message: 'Alert deactivated successfully', alert: updatedAlert });
  } catch (error) {
    console.error('Error deactivating alert:', error);
    res.status(400).json({ error: error.message });
  }
};



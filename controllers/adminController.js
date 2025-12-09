import { PartnerCloth } from "../models/partnerClothes.js";
import { User } from "../models/user.js";
import { Payment } from "../models/payment.js";

// --- Users ---

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });
    
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

export const getAllPartners = async (req, res) => {
  try {
    const users = await User.find({ role: 'partner' })
      .select("-password")
      .sort({ createdAt: -1 });
    
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching partners:", error);
    res.status(500).json({ message: "Error fetching partners", error: error.message });
  }
};

export const getAllStylists = async (req, res) => {
  try {
    const users = await User.find({ role: 'styler' })
      .select("-password")
      .sort({ createdAt: -1 });
    
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching stylists:", error);
    res.status(500).json({ message: "Error fetching stylists", error: error.message });
  }
};

// --- Products ---

export const getAllProducts = async (req, res) => {
  try {
    // Fetch all partner clothes and populate owner details
    const products = await PartnerCloth.find()
      .populate("ownerId", "name email")
      .sort({ createdAt: -1 });

    // Map to the expected Product interface
    const formattedProducts = products.map((product) => ({
      _id: product._id,
      name: product.name,
      price: product.price,
      stock: 0, // Stock management not yet implemented in PartnerCloth
      seller: product.ownerId ? product.ownerId.name : "Unknown Partner",
      sellerEmail: product.ownerId ? product.ownerId.email : "",
      description: product.description || "", // Assuming description might be added later or is missing
      images: product.image ? [product.image] : [],
      createdAt: product.createdAt,
    }));

    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await PartnerCloth.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};

// --- Orders ---

export const getAllOrders = async (req, res) => {
  try {
    // Using Payments as Orders for now
    const payments = await Payment.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    const formattedOrders = payments.map(payment => ({
      _id: payment._id,
      orderNumber: `ORD-${payment._id.toString().slice(-6).toUpperCase()}`,
      customerName: payment.userId ? payment.userId.name || "Unknown" : "Unknown",
      customerEmail: payment.userId ? payment.userId.email : "Unknown",
      totalAmount: payment.amount,
      status: payment.status === 'completed' ? 'delivered' : payment.status,
      items: [{ productName: payment.description || "Service/Product", quantity: 1, price: payment.amount }],
      createdAt: payment.createdAt
    }));

    res.status(200).json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

export const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id).populate("userId", "name email");
    
    if (!payment) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = {
      _id: payment._id,
      orderNumber: `ORD-${payment._id.toString().slice(-6).toUpperCase()}`,
      customerName: payment.userId ? payment.userId.name || "Unknown" : "Unknown",
      customerEmail: payment.userId ? payment.userId.email : "Unknown",
      totalAmount: payment.amount,
      status: payment.status === 'completed' ? 'delivered' : payment.status,
      items: [{ productName: payment.description || "Service/Product", quantity: 1, price: payment.amount }],
      createdAt: payment.createdAt
    };

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order details", error: error.message });
  }
};

// --- Analytics ---

export const getAdminAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStylists = await User.countDocuments({ role: 'styler' });
    const totalPartners = await User.countDocuments({ role: 'partner' });
    const totalPayments = await Payment.countDocuments({ status: 'completed' });
    
    const revenueResult = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Calculate total logins
    const loginResult = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$loginCount" } } }
    ]);
    const totalLogins = loginResult.length > 0 ? loginResult[0].total : 0;

    // Weekly Trend (Last 4 weeks)
    const weeklyTrend = [];
    for (let i = 0; i < 4; i++) {
        const start = new Date();
        start.setDate(start.getDate() - (i + 1) * 7);
        const end = new Date();
        end.setDate(end.getDate() - i * 7);
        
        const registrations = await User.countDocuments({
            createdAt: { $gte: start, $lt: end }
        });
        
        weeklyTrend.push({
            week: `Week ${4 - i}`,
            registrations,
            logins: 0 // Login tracking not implemented yet
        });
    }
    
    res.status(200).json({
        weeklyTrend: weeklyTrend.reverse(),
        totalUsers,
        totalStylists,
        totalPartners,
        totalPayments,
        totalRevenue,
        totalLogins
    });
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    res.status(500).json({ message: "Error fetching analytics", error: error.message });
  }
};

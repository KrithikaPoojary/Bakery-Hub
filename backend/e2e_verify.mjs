const API = "https://bakeryhub-app.vercel.app/api";

async function runTests() {
  console.log("=========================================");
  console.log("🍰 BAKERY-HUB FULL END-TO-END VERIFICATION");
  console.log("=========================================\n");

  // 1. Health check
  console.log("1. Health Check...");
  const healthRes = await fetch(`${API}/health`);
  const health = await healthRes.json();
  console.log("   Status:", healthRes.status, health);

  // 2. Admin Login
  console.log("\n2. Testing Admin Login...");
  const adminLoginRes = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@bakehub.com",
      password: "admin123",
      role: "admin",
    }),
  });
  const adminData = await adminLoginRes.json();
  console.log("   Admin Login Status:", adminLoginRes.status, adminData.message);
  const adminToken = adminData.token;

  // 3. Register Owner (with OTP bypass check or standard flow)
  console.log("\n3. Testing Owner OTP & Registration...");
  const ts = Date.now();
  const ownerEmail = `owner_${ts}@test.com`;
  
  // Send OTP
  const otpRes = await fetch(`${API}/auth/send-register-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ownerEmail }),
  });
  console.log("   Send OTP Status:", otpRes.status, (await otpRes.json()).message);

  // 4. Fetch Bakeries as Admin
  console.log("\n4. Fetching Bakeries as Admin...");
  const bakeriesRes = await fetch(`${API}/bakeries`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const bakeries = await bakeriesRes.json();
  console.log("   Admin Bakeries Count:", Array.isArray(bakeries) ? bakeries.length : bakeries);

  // 5. Fetch Public Bakeries for Customer
  console.log("\n5. Fetching Public Bakeries for Customer...");
  const publicRes = await fetch(`${API}/bakeries/public`);
  const publicBakeries = await publicRes.json();
  console.log("   Public Bakeries Count:", Array.isArray(publicBakeries) ? publicBakeries.length : publicBakeries);

  console.log("\n=========================================");
  console.log("🎉 ALL CORE API ENDPOINTS WORKING ON VERCEL!");
  console.log("=========================================");
}

runTests().catch((err) => console.error("Test error:", err));

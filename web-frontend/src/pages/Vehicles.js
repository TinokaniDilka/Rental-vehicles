import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    api.get("/vehicles")
      .then(res => setVehicles(res.data))
      .catch(err => console.log(err));
  }, []);

  const featuredCars = [
    {
      id: 1,
      name: "Jeep Wrangler Rubicon",
      category: "SUV",
      pricePerDay: 150,
      image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80",
      description: "Ultimate off-road capability"
    },
    {
      id: 2,
      name: "Ford Mustang GT",
      category: "Sports",
      pricePerDay: 200,
      image: "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=800&q=80",
      description: "American muscle power"
    },
    {
      id: 3,
      name: "Tesla Model S",
      category: "Electric",
      pricePerDay: 180,
      image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80",
      description: "Electric luxury sedan"
    },
    {
      id: 4,
      name: "BMW X5",
      category: "Luxury SUV",
      pricePerDay: 175,
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
      description: "Premium German engineering"
    }
  ];

  const filteredVehicles = vehicles.filter(v =>
    v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "0", background: "var(--bg-main)" }}>
        {/* Hero Section */}
        <div style={{
          position: "relative",
          height: "550px",
          background: "var(--bg-main)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 80px",
          overflow: "hidden"
        }}>
          {/* Orange Abstract Road Graphic */}
          <div style={{
            position: "absolute",
            bottom: "-100px",
            right: "-200px",
            width: "600px",
            height: "400px",
            background: "linear-gradient(135deg, #1E3A8A 0%, #172554 100%)",
            borderRadius: "50% 0 0 50%",
            transform: "rotate(-15deg)",
            opacity: 0.8,
            zIndex: 1
          }} />
          
          <div style={{
            position: "absolute",
            bottom: "-50px",
            right: "-100px",
            width: "400px",
            height: "300px",
            background: "linear-gradient(135deg, #E5C04D 0%, #D4AF37 100%)",
            borderRadius: "50% 0 0 50%",
            transform: "rotate(-10deg)",
            opacity: 0.6,
            zIndex: 1
          }} />

          {/* Text Content */}
          <div style={{ position: "relative", zIndex: 2, maxWidth: "600px" }}>
            <h1 style={{
              fontSize: "56px",
              fontWeight: "800",
              color: "var(--text-primary)",
              margin: "0 0 20px 0",
              lineHeight: "1.2"
            }}>
              Find Your Best <span style={{ color: "#D4AF37" }}>Dream Car</span> for Rental
            </h1>
            <p style={{
              fontSize: "18px",
              color: "var(--text-secondary)",
              marginBottom: "30px",
              lineHeight: "1.6"
            }}>
              Discover our premium collection of vehicles for every occasion. From luxury sedans to rugged SUVs, find the perfect ride for your journey.
            </p>
            <button style={{
              background: "transparent",
              color: "var(--text-primary)",
              border: "2px solid var(--text-secondary)",
              padding: "15px 40px",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}>
              View All Cars
            </button>
          </div>

          {/* Car Image */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <img
              src="https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80"
              alt="Dream Car"
              style={{
                width: "650px",
                height: "auto",
                maxHeight: "420px",
                objectFit: "contain",
                filter: "drop-shadow(0 20px 40px rgba(30, 58, 138, 0.4))"
              }}
            />
          </div>
        </div>

        {/* Search Bar */}
        <div style={{
          position: "relative",
          marginTop: "-30px",
          zIndex: 10,
          display: "flex",
          justifyContent: "center",
          padding: "0 20px"
        }}>
          <div style={{
            display: "flex",
            gap: "10px",
            background: "var(--bg-surface)",
            padding: "10px",
            borderRadius: "50px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            maxWidth: "600px",
            width: "100%",
            border: "1px solid var(--border-color)"
          }}>
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                padding: "15px 25px",
                fontSize: "16px",
                borderRadius: "40px",
                background: "transparent",
                color: "var(--text-primary)"
              }}
            />
            <button style={{
              background: "#1E3A8A",
              color: "white",
              border: "none",
              padding: "15px 40px",
              borderRadius: "40px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}>
              Search
            </button>
          </div>
        </div>

        {/* Vehicle Grid */}
        <div style={{ padding: "60px 40px" }}>
          <h2 style={{
            fontSize: "32px",
            fontWeight: "700",
            marginBottom: "30px",
            color: "var(--text-primary)"
          }}>
            Featured Vehicles
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "30px"
          }}>
            {featuredCars.map(car => (
              <div key={car.id} style={{
                background: "var(--bg-surface)",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                cursor: "pointer"
              }}>
                <div style={{
                  height: "200px",
                  overflow: "hidden",
                  background: "linear-gradient(135deg, #1E3A8A 0%, #172554 100%)",
                  position: "relative"
                }}>
                  <img
                    src={car.image}
                    alt={car.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                  />
                  <div style={{
                    position: "absolute",
                    top: "15px",
                    right: "15px",
                    background: "#D4AF37",
                    color: "var(--text-primary)",
                    padding: "5px 15px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600"
                  }}>
                    {car.category}
                  </div>
                </div>
                <div style={{ padding: "20px" }}>
                  <h3 style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    marginBottom: "8px",
                    color: "var(--text-primary)"
                  }}>
                    {car.name}
                  </h3>
                  <p style={{
                    color: "var(--text-secondary)",
                    marginBottom: "15px",
                    fontSize: "14px"
                  }}>
                    {car.description}
                  </p>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <span style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "#1E3A8A"
                      }}>
                        ${car.pricePerDay}
                      </span>
                      <span style={{
                        fontSize: "14px",
                        color: "var(--text-muted)",
                        marginLeft: "5px"
                      }}>
                        /day
                      </span>
                    </div>
                    <button style={{
                      background: "#1E3A8A",
                      color: "white",
                      border: "none",
                      padding: "10px 25px",
                      borderRadius: "25px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}>
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Database Vehicles */}
          {filteredVehicles.length > 0 && (
            <>
              <h2 style={{
                fontSize: "32px",
                fontWeight: "700",
                marginTop: "60px",
                marginBottom: "30px",
                color: "var(--text-primary)"
              }}>
                All Vehicles
              </h2>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "30px"
              }}>
                {filteredVehicles.map(v => (
                  <div key={v._id} style={{
                    background: "var(--bg-surface)",
                    borderRadius: "20px",
                    padding: "20px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
                  }}>
                    <h3 style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      marginBottom: "10px",
                      color: "var(--text-primary)"
                    }}>
                      {v.name}
                    </h3>
                    <p style={{
                      color: "var(--text-secondary)",
                      marginBottom: "5px"
                    }}>
                      Category: {v.category}
                    </p>
                    <p style={{
                      color: "var(--text-secondary)",
                      marginBottom: "15px"
                    }}>
                      Price: ${v.pricePerDay}/day
                    </p>
                    <button style={{
                      background: "#1E3A8A",
                      color: "white",
                      border: "none",
                      padding: "10px 25px",
                      borderRadius: "25px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}>
                      Book Now
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

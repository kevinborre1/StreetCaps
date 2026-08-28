"use client";
import { useState, useEffect } from "react";
import "./globals.css";
import { motion, AnimatePresence } from "framer-motion";

const categories = ["Ver Todo", "Snapback", "Trucker", "Fitted", "Dad Hat"];

export default function Tienda() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Ver Todo");
  const [dbProducts, setDbProducts] = useState([]);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`https://streetcapsapi.onrender.com/api/productos?t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setDbProducts(data);
        }
      } catch (error) {
        console.error("Error al conectar con la API:", error);
      }
    };

    cargarProductos();
  }, []);

  const addToCart = (product) => {
    const currentCartItem = cart.find(item => item.id === product.id);
    const currentQuantity = currentCartItem ? currentCartItem.quantity : 0;

    if (currentQuantity >= product.stock) {
      alert(`¡Ups! Solo nos quedan ${product.stock} unidades de este modelo.`);
      return;
    }

    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + item.precio * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const phoneNumber = "1124959055"; // Número de WhatsApp de Street Caps
    
    let message = "Hola Street Caps! 🧢 Quiero hacer el siguiente pedido:\n\n";
    cart.forEach((item) => {
      message += `- ${item.nombre} (${item.tipo}) x${item.quantity} - $${item.precio * item.quantity}\n`;
    });
    message += `\n*Total a pagar: $${total}*\n\nMe gustaría coordinar el pago y el envío.`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  };

  const handleInstagramCheckout = async () => {
    if (cart.length === 0) return;
    
    let message = "Hola Street Caps! 🧢 Quiero hacer el siguiente pedido:\n\n";
    cart.forEach((item) => {
      message += `- ${item.nombre} (${item.tipo}) x${item.quantity} - $${item.precio * item.quantity}\n`;
    });
    message += `\n*Total a pagar: $${total}*\n\nMe gustaría coordinar el pago y el envío.`;
    
    try {
      await navigator.clipboard.writeText(message);
      alert("¡Pedido copiado! Te redirigimos al chat. Solo tenés que poner 'Pegar' y enviarnos el mensaje.");
    } catch (err) {
      console.error("No se pudo copiar automáticamente", err);
    }
    
    window.open("https://ig.me/m/streetcaps.ok", "_blank");
  };

  const handleMercadoPagoCheckout = async () => {
    if (cart.length === 0) return;
    
    let message = "Hola Street Caps! 🧢 Ya realicé el pago de mi pedido:\n\n";
    cart.forEach((item) => {
      message += `- ${item.nombre} (${item.tipo}) x${item.quantity}\n`;
    });
    message += `\n*Total pagado: $${total}*`;
    
    try {
      await navigator.clipboard.writeText(message);
      alert("¡Pedido copiado! Te redirigimos al chat de WhatsApp. Solo tenés que poner 'Pegar' y enviarnos el mensaje con tu comprobante.");
      
      window.open("https://link.mercadopago.com.ar/streetcaps", "_blank");
    } catch (err) {
      console.error("Error", err);
    }
  };

  const filteredProducts = activeCategory === "Ver Todo"
    ? dbProducts
    : dbProducts.filter(product => product.tipo === activeCategory);

  return (
    <main>
      <div className="top-banner">
        📦 Envíos a todo el país | Elegí tu próxima gorra
      </div>

      <nav className="navbar">
        <div className="logo">STREET CAPS</div>
        <button 
          className="pill" 
          onClick={() => setIsCartOpen(true)}
          style={{ border: 'none', background: '#fff', color: '#000', fontWeight: 'bold' }}
        >
          Carrito ({cart.reduce((acc, item) => acc + item.quantity, 0)})
        </button>
      </nav>

      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Caps for your everyday style.</h1>
          <p className="hero-subtitle">
            Los clásicos del streetwear, elevados. Descubrí nuestra colección de gorras y marcá la diferencia.
          </p>
          <button className="btn-hero" onClick={() => window.scrollTo({ top: window.innerHeight * 0.6, behavior: 'smooth' })}>
            Ver colección
          </button>
        </div>
      </header>

      <h2 className="section-title">Gorras Street Caps</h2>

      <div className="filters">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`pill ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <section className="product-grid">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => (
            <motion.div 
              key={product.id} 
              className="product-card"
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <img src={product.imagenUrl} alt={product.nombre} className="product-image" />

              <div className="product-info">
                <p className="product-type">{product.tipo}</p>
                <h3 className="product-name">{product.nombre}</h3>
                <p className="product-price">${product.precio.toLocaleString("es-AR")}</p>
                
                <p style={{ 
                  fontSize: '0.8rem', 
                  color: product.stock > 0 ? 'var(--text-secondary)' : '#ff4444', 
                  marginBottom: '12px' 
                }}>
                  {product.stock > 0 ? `Stock disponible: ${product.stock}` : "Sin stock"}
                </p>

                <button 
                  className="btn-add" 
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                  style={{ 
                    opacity: product.stock === 0 ? 0.5 : 1, 
                    cursor: product.stock === 0 ? 'not-allowed' : 'pointer' 
                  }}
                >
                  {product.stock === 0 ? "Agotado" : "Agregar al carrito"}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </section>

      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            className="cart-modal"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="cart-header">
              <h2>Tu Pedido</h2>
              <button className="close-btn" onClick={() => setIsCartOpen(false)}>×</button>
            </div>
            
            <div className="cart-items">
              {cart.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>El carrito está vacío.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div>
                      <p style={{ fontWeight: 'bold' }}>{item.nombre}</p>
                      <p style={{ fontSize: '0.8rem', color: '#a0a0a0' }}>Cant: {item.quantity}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p>${(item.precio * item.quantity).toLocaleString("es-AR")}</p>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        style={{ background: 'none', border: 'none', color: '#ff4444', fontSize: '0.8rem', cursor: 'pointer', marginTop: '5px' }}
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Total:</span>
                  <span>${total.toLocaleString("es-AR")}</span>
                </div>
                <button className="btn-whatsapp" onClick={handleCheckout}>
                  Pedir por WhatsApp
                </button>
                <button className="btn-mercadopago" onClick={handleMercadoPagoCheckout}>
                  Pagar con Mercado Pago
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
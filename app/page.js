"use client";
import { useState } from "react";
import "./globals.css";

// Base de datos de ejemplo (podés reemplazar las fotos con las tuyas en la carpeta /public)
const dbProducts = [
  { id: 1, name: "Gorra Clásica Negra", type: "Snapback", price: 15000, img: "/gorra1.jpg",stock: 5 },
  { id: 2, name: "Street Drop #1", type: "Trucker", price: 12000, img: "/gorra2.jpg",stock: 3 },
  { id: 3, name: "New Era Style Black", type: "Fitted", price: 18000, img: "/gorra3.jpg",stock: 2 },
  { id: 4, name: "Vintage Grey", type: "Dad Hat", price: 14000, img: "/gorra4.jpg",stock: 4 },
  { id: 5, name: "Classic White", type: "Snapback", price: 16000, img: "/gorra3.jpg",stock: 6 },
  { id: 6, name: "Jordan", type: "Dad Hat", price: 14000, img: "/gorra4.jpg",stock: 1 },



];

const categories = ["Ver Todo", "Snapback", "Trucker", "Fitted", "Dad Hat"];

export default function Home() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Ver Todo");

  // Filtrado de productos
  const filteredProducts = activeCategory === "Ver Todo" 
    ? dbProducts 
    : dbProducts.filter(p => p.type === activeCategory);

  // Funciones del carrito
const addToCart = (product) => {
    // Primero, verificamos cuántas de estas gorras ya hay en el carrito
    const currentCartItem = cart.find(item => item.id === product.id);
    const currentQuantity = currentCartItem ? currentCartItem.quantity : 0;

    // Si la cantidad en el carrito ya es igual o mayor al stock, frenamos la acción
    if (currentQuantity >= product.stock) {
      alert(`¡Ups! Solo nos quedan ${product.stock} unidades de este modelo.`);
      return;
    }

    // Si hay stock, lo agregamos normalmente
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

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Redirección a WhatsApp
  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    // REEMPLAZAR con el número de la tienda (código de país + número, ej: 5491123456789)
    const phoneNumber = "5491133763050"; 
    
    let message = "Hola Street Caps! 🧢 Quiero hacer el siguiente pedido:\n\n";
    cart.forEach((item) => {
      message += `- ${item.name} (${item.type}) x${item.quantity} - $${item.price * item.quantity}\n`;
    });
    message += `\n*Total a pagar: $${total}*\n\nMe gustaría coordinar el pago y el envío.`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  };
  const handleInstagramCheckout = async () => {
    if (cart.length === 0) return;
    
    let message = "Hola Street Caps! 🧢 Quiero hacer el siguiente pedido:\n\n";
    cart.forEach((item) => {
      message += `- ${item.name} (${item.type}) x${item.quantity} - $${item.price * item.quantity}\n`;
    });
    message += `\n*Total a pagar: $${total}*\n\nMe gustaría coordinar el pago y el envío.`;
    
    try {
      // Intentamos copiar el mensaje al portapapeles
      await navigator.clipboard.writeText(message);
      alert("¡Pedido copiado! Te redirigimos al chat. Solo tenés que poner 'Pegar' y enviarnos el mensaje.");
    } catch (err) {
      console.error("No se pudo copiar automáticamente", err);
    }
    
    // Abrimos el chat de Instagram directamente (reemplazá con tu usuario si cambia)
    window.open("https://ig.me/m/streetcaps.ok", "_blank");
  };

  const handleMercadoPagoCheckout = async () => {
    if (cart.length === 0) return;
    
    let message = "Hola Street Caps! 🧢 Ya realicé el pago de mi pedido:\n\n";
    cart.forEach((item) => {
      message += `- ${item.name} (${item.type}) x${item.quantity}\n`;
    });
    message += `\n*Total pagado: $${total}*`;
    
    try {
      // Copiamos el pedido al portapapeles para que te lo manden con el comprobante
      await navigator.clipboard.writeText(message);
      
      // Alerta con instrucciones claras para el cliente
      alert(`El total de tu pedido es $${total}.\n\nTe vamos a redirigir a Mercado Pago. Por favor, ingresá este monto exacto.\n\n(El detalle de tu pedido se copió automáticamente para que nos lo mandes junto con el comprobante).`);
      
      // ACÁ PONES TU LINK DE MERCADO PAGO
      // Se saca desde la app de MP -> Cobrar con link -> Crear link sin monto fijo (tu perfil)
      window.open(" https://link.mercadopago.com.ar/kevinborre", "_blank");
    } catch (err) {
      console.error("Error", err);
    }
  };
  return (
    <main>
      {/* Top Banner */}
      <div className="top-banner">
        📦 Envíos a todo el país | Elegí tu próxima gorra
      </div>

      {/* Navbar */}
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
     {/* NUEVA SECCIÓN DE BIENVENIDA CON IMAGEN */}
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Estilo Urbano Premium</h1>
          <p className="hero-subtitle">
            Los clásicos del streetwear, elevados. Descubrí nuestra nueva colección de gorras y marcá la diferencia.
          </p>
          <button className="btn-hero" onClick={() => window.scrollTo({ top: window.innerHeight * 0.6, behavior: 'smooth' })}>
            Ver colección
          </button>
        </div>
      </header>

      {/* Título de la sección de productos */}
      <h2 className="section-title">Gorras Street Caps</h2>

      {/* Filtros (esto ya lo tenés) */}
      <div className="filters"></div>
      {/* Filtros */}
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

      {/* Grilla de Productos */}
      <section className="product-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card">
            <div className="image-placeholder">
              {/* Usar etiqueta <img> estándar o <Image> de Next.js si tenés las rutas configuradas */}
              {product.img ? (
                <img src={product.img} alt={product.name} />
              ) : (
                <span style={{ color: '#444' }}>Foto Gorra</span>
              )}
            </div>
            <div className="product-info">
              <p className="product-type">{product.type}</p>
              <h3 className="product-name">{product.name}</h3>
              <p className="product-price">${product.price.toLocaleString("es-AR")}</p>
              
              {/* Texto que muestra el stock dinámicamente */}
              <p style={{ 
                fontSize: '0.8rem', 
                color: product.stock > 0 ? 'var(--text-secondary)' : '#ff4444', 
                marginBottom: '12px' 
              }}>
                {product.stock > 0 ? `Stock disponible: ${product.stock}` : "Sin stock"}
              </p>

              {/* Botón inteligente que se desactiva si no hay stock */}
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
          </div>
        ))}
      </section>

      {/* Cart Modal / Sidebar */}
      {isCartOpen && (
        <div className="cart-modal">
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
                    <p style={{ fontWeight: 'bold' }}>{item.name}</p>
                    <p style={{ fontSize: '0.8rem', color: '#a0a0a0' }}>Cant: {item.quantity}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p>${(item.price * item.quantity).toLocaleString("es-AR")}</p>
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
      
      </div>
    )}
    </main>
  );
}
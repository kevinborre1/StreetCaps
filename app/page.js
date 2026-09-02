"use client";
import { useState, useEffect } from "react";
import "./globals.css";
import { motion, AnimatePresence } from "framer-motion";

const categories = ["Ver Todo", "New Era", "Chrome Hearts", "Jordan", "Belicas"];

export default function Tienda() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Ver Todo");
  const [dbProducts, setDbProducts] = useState([]);

  
  // 1. Agregamos "estrellas" a las reseñas de prueba
  const [reseñas, setReseñas] = useState([]); // Arranca vacío
  const [nuevaReseña, setNuevaReseña] = useState({ nombre: "", comentario: "", estrellas: 5 });
  // --------------------------------

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

  const handlePagarConMercadoPago = async () => {
  try {
    // 1. Mapeamos tu estado 'cart' para que coincida exactamente con las 
    // propiedades que espera tu clase ItemCarrito en Java.
    const itemsParaElBackend = cart.map(item => ({
      nombre: item.nombre, // O item.title, dependiendo de cómo lo guardes en tu base
      quantity: item.quantity,
      precio: item.precio // Asegurate de usar la propiedad correcta del precio
    }));

    // 2. Hacemos la petición POST a tu backend (ahora apuntando a tu compu para probar)
    const response = await fetch('http://localhost:8080/api/crear-pago', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: itemsParaElBackend })
    });

    if (!response.ok) {
      throw new Error("Error al comunicarse con el servidor");
    }

    // ¡ESTA ES LA LÍNEA QUE FALTABA!
    const data = await response.json(); 

    // 3. Si el backend nos devuelve el link, redirigimos al usuario
    if (data.init_point) {
      window.location.href = data.init_point;
    }

  } catch (error) {
    console.error("Error al iniciar el pago:", error);
    alert("Hubo un problema al procesar el pago. Intentá de nuevo.");
  }
};

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
    
    const phoneNumber = "1124959055";
    
    let message = "Hola Street Caps! 🧢 Quiero hacer el siguiente pedido:\n\n";
    cart.forEach((item) => {
      message += `- ${item.nombre} (${item.tipo}) x${item.quantity} - $${item.precio * item.quantity}\n`;
    });
    message += `\n*Total a pagar: $${total}*\n\nMe gustaría coordinar el pago y el envío.`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
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

  // 2. Traer las reseñas al cargar la página
  useEffect(() => {
    const cargarReseñas = async () => {
      try {
        const response = await fetch("");
        if (response.ok) {
          const data = await response.json();
          setReseñas(data.reverse()); // Las damos vuelta para ver las más nuevas primero
        }
      } catch (error) {
        console.error("Error al cargar reseñas:", error);
      }
    };
    cargarReseñas();
  }, []);

  // 3. Modificamos la función para que haga el POST al backend
  const handleAgregarReseña = async (e) => {
    e.preventDefault();
    if (!nuevaReseña.nombre.trim() || !nuevaReseña.comentario.trim()) return;

    const reseñaParaBackend = {
      nombre: nuevaReseña.nombre,
      comentario: nuevaReseña.comentario,
      estrellas: nuevaReseña.estrellas,
      fecha: new Date().toLocaleDateString("es-AR")
    };

    try {
      // Hacemos el POST a tu API
      const response = await fetch('https://streetcapsapi.onrender.com/api/resenas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reseñaParaBackend)
      });

      if (response.ok) {
        const reseñaGuardada = await response.json();
        // Agregamos la reseña que nos devuelve la base de datos a la pantalla
        setReseñas([reseñaGuardada, ...reseñas]);
        setNuevaReseña({ nombre: "", comentario: "", estrellas: 5 }); 
        alert("¡Gracias por tu reseña!");
      }
    } catch (error) {
      console.error("Error al enviar la reseña:", error);
      alert("Hubo un problema de conexión.");
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

      {/* ========================================= */}
      {/* SECCIÓN DE RESEÑAS CON ESTRELLAS */}
      {/* ========================================= */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 className="section-title">Lo que dicen nuestros clientes</h2>

        {/* Formulario para dejar reseña */}
        <form onSubmit={handleAgregarReseña} style={{ 
          display: 'flex', flexDirection: 'column', gap: '1rem', 
          marginBottom: '3rem', background: '#1a1a1a', padding: '2rem', borderRadius: '12px' 
        }}>
          <h3 style={{ color: 'white', marginTop: 0, marginBottom: '5px', fontSize: '1.2rem' }}>Dejá tu experiencia</h3>
          
          {/* SELECTOR DE ESTRELLAS */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span 
                key={star}
                onClick={() => setNuevaReseña({ ...nuevaReseña, estrellas: star })}
                style={{ 
                  cursor: 'pointer', 
                  fontSize: '1.8rem', 
                  color: star <= nuevaReseña.estrellas ? '#FFD700' : '#444', // Dorado si está seleccionada, gris oscuro si no
                  transition: 'color 0.2s'
                }}
              >
                ★
              </span>
            ))}
          </div>

          <input
            type="text"
            placeholder="Tu nombre"
            value={nuevaReseña.nombre}
            onChange={(e) => setNuevaReseña({ ...nuevaReseña, nombre: e.target.value })}
            required
            style={{ 
              padding: '12px', borderRadius: '8px', border: '1px solid #333', 
              background: '#2a2a2a', color: 'white', fontSize: '1rem' 
            }}
          />
          
          <textarea
            placeholder="¿Qué te parecieron nuestras gorras?"
            value={nuevaReseña.comentario}
            onChange={(e) => setNuevaReseña({ ...nuevaReseña, comentario: e.target.value })}
            required
            rows="3"
            style={{ 
              padding: '12px', borderRadius: '8px', border: '1px solid #333', 
              background: '#2a2a2a', color: 'white', fontSize: '1rem', resize: 'vertical' 
            }}
          ></textarea>
          
          <button type="submit" className="btn-hero" style={{ alignSelf: 'flex-start', padding: '10px 24px', width: 'auto' }}>
            Publicar reseña
          </button>
        </form>

        {/* Lista de reseñas en formato tarjetas */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {reseñas.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', gridColumn: '1 / -1', textAlign: 'center' }}>
              Aún no hay reseñas. ¡Sé el primero en comentar!
            </p>
          ) : (
            reseñas.map((res) => (
              <div key={res.id} style={{ 
                background: '#111', 
                padding: '1.5rem', 
                borderRadius: '10px', 
                borderLeft: '4px solid #fff',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: 'white', fontSize: '1.1rem' }}>{res.nombre}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>{res.fecha}</span>
                  </div>
                  
                  {/* DIBUJAMOS LAS ESTRELLAS EN LA TARJETA */}
                  <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} style={{ 
                        color: star <= res.estrellas ? '#FFD700' : '#444', 
                        fontSize: '1.1rem' 
                      }}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                
                <p style={{ color: '#ccc', margin: 0, lineHeight: '1.5', wordBreak: 'break-word', marginTop: '5px' }}>
                  "{res.comentario}"
                </p>
              </div>
            ))
          )}
        </div>
      </section>
      {/* ========================================= */}

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
              
                {/* Copia el resumen del pedido al portapapeles y abre el link de Mercado Pago 
                <button className="btn-mercadopago" onClick={handleMercadoPagoCheckout}>
                  Pagar con Mercado Pago
                </button>
                */}
                {/* Envía los items del carrito al backend (localhost:8080) para procesar el pago directo 
                <button 
              className="btn-pagar" 
              onClick={handlePagarConMercadoPago}
            >
              Pagar con Mercado Pago
            </button>
          */}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
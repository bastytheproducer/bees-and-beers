// Versión 9.0: Soporte para editor visual full con bloques, imágenes y drag-drop
const fs = require("fs");
const path = require("path");

const defaultContent = {
  version: "9.0",
  brand: "Bees and Beers",
  email: "contacto@tudominio.cl",
  theme: {
    primary: "#C97A3D",
    secondary: "#E39655",
    bg: "#241713",
    bgDeep: "#1A0F0C",
    paper: "#F4ECDD",
    ink: "#2B1B12"
  },
  blocks: [
    {
      id: "hero-main",
      type: "hero",
      order: 0,
      content: {
        eyebrow: "Elaboración artesanal",
        title: "Cervezas, hidromiel y bebestibles fermentados varios",
        tagline: "Elaboradas con pasión y tradición.",
        modes: "Ventas al por mayor · Retiro en tienda · Despacho a domicilio",
        badge: "🔞 Venta exclusiva para mayores de 18 años",
        primaryCta: "Ver catálogo",
        secondaryCta: "Cómo funciona",
        backgroundImage: null,
        gradient: true
      },
      style: {
        bgColor: "#241713",
        textColor: "#ffffff",
        padding: "40px 20px",
        textAlign: "center"
      }
    },
    {
      id: "process-section",
      type: "process",
      order: 1,
      content: {
        title: "Proceso",
        steps: [
          {
            title: "Eliges y pagas",
            description: "Tarjeta de crédito, débito, transferencia u otros medios habilitados en Mercado Pago."
          },
          {
            title: "Confirmamos tu pedido",
            description: "Recibes un correo de confirmación apenas se aprueba el pago, con el detalle de tu compra."
          },
          {
            title: "Preparamos y despachamos",
            description: "Embotellamos y coordinamos el envío o retiro. La entrega del despacho se estima en una hora y media desde que se hace el pedido."
          }
        ]
      },
      style: {
        bgColor: "#F4ECDD",
        textColor: "#2B1B12",
        padding: "40px 20px",
        layout: "grid"
      }
    },
    {
      id: "faq-section",
      type: "faq",
      order: 2,
      content: {
        title: "Preguntas frecuentes",
        items: [
          {
            question: "¿Puedo comprar si soy menor de edad?",
            answer: "No. La venta de alcohol a menores de 18 años está prohibida por ley. Nos reservamos el derecho de solicitar verificación de identidad al momento de la entrega."
          },
          {
            question: "¿Cuánto demora el despacho?",
            answer: "Estimamos la entrega en una hora y media desde que se hace el pedido, dependiendo de la zona y el tráfico."
          },
          {
            question: "¿Qué medios de pago aceptan?",
            answer: "Tarjetas de crédito y débito, transferencia bancaria y otros medios disponibles en la pasarela de pago."
          },
          {
            question: "¿Hay devoluciones?",
            answer: "Si tu pedido llega dañado o incompleto, escríbenos dentro de las 48 horas siguientes a la entrega y lo resolvemos."
          }
        ]
      },
      style: {
        bgColor: "#ffffff",
        textColor: "#2B1B12",
        padding: "40px 20px"
      }
    }
  ],
  footerText: "Bees and Beers — bebidas artesanales"
};

function getContentPath() {
  return path.join(__dirname, "..", "data", "site-content.json");
}

function readSiteContent() {
  try {
    const filePath = getContentPath();
    if (!fs.existsSync(filePath)) {
      return defaultContent;
    }
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading site content:", error);
    return defaultContent;
  }
}

function saveSiteContent(content) {
  try {
    const filePath = getContentPath();
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error saving site content:", error);
    return false;
  }
}

module.exports = { readSiteContent, saveSiteContent };

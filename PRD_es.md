# PRD: Asistente de IA para Expansión de Negocio de Nicho

## 1. La Necesidad

El núcleo del proyecto es superar las limitaciones de tiempo y conocimiento técnico de un empresario individual para escalar exponencialmente un negocio de nicho (venta de puros y servicios artesanales). El objetivo es delegar tareas complejas y repetitivas —desde el marketing y las ventas hasta la atención al cliente— en un asistente de IA, permitiendo al negocio crecer sin una inversión masiva en personal. Se busca transformar un proceso de marketing manual y lento en un sistema ágil y automatizado que pueda identificar y capitalizar oportunidades de venta en tiempo real a través de múltiples canales digitales.

## 2. Requisitos Funcionales

### R1: Experto Digital y Asistente de Ventas (Chatbot)
- **R1.1:** Crear un asistente de IA ("experto digital") capaz de responder preguntas técnicas sobre la manufactura e historia de los puros.
- **R1.2:** El asistente debe ser multilingüe y, tras una conversación informativa, debe guiar sutilmente a los usuarios hacia productos relevantes en la tienda online.
- **R1.3:** El canal de interacción principal con los clientes será WhatsApp, manejando tanto texto como, potencialmente, llamadas.

### R2: Monitoreo y Captura de Oportunidades en Redes Sociales
- **R2.1:** La IA debe monitorear activamente grupos y comunidades online (ej. en Facebook) de aficionados a los puros.
- **R2.2:** Debe ser capaz de identificar preguntas que representen oportunidades de venta (ej. "¿Dónde puedo comprar X herramienta?").
- **R2.3:** Al detectar una oportunidad, la IA debe (a) alertar al propietario o (b) responder directamente al usuario de forma autónoma con un enlace al producto.

### R3: Creación y Ejecución de Campañas de Marketing Ágiles
- **R3.1:** El propietario debe poder iniciar campañas de marketing (ej. "flash sales" de stock sobrante) mediante una simple interacción de voz o texto con el asistente.
- **R3.2:** El asistente debe ser capaz de generar el contenido de la campaña, incluyendo texto persuasivo e imágenes relevantes.
- **R3.3:** La campaña debe publicarse simultáneamente en todas las redes sociales conectadas a la plataforma.

### R4: Expansión al Mercado de Eventos
- **R4.1:** Contextualizar a la IA para entender el mercado de la planificación de eventos y sus actores clave ("Event Planners").
- **R4.2:** La IA debe identificar clientes potenciales para servicios de torcedor de puros en eventos (ej. campos de golf de élite, organizadores de eventos en redes sociales).
- **R4.3:** El asistente debe ejecutar campañas de marketing dirigidas a este nicho para generar un alto volumen de cotizaciones, permitiendo al negocio subcontratar el trabajo y escalar.

### R5: Sistema de Ventas con Evasión de Restricciones
- **R5.1:** Implementar un sistema donde la IA gestione un catálogo de productos que, al ser enlazados desde una conversación (ej. WhatsApp), lleven a una página de producto con una descripción ambigua.
- **R5.2:** El objetivo de este requisito es eludir la revisión de las pasarelas de pago que restringen la venta de tabaco, permitiendo así expandir el negocio.

## 3. Asunciones Clave (Assumptions)

- **A1:** Se asume que es técnicamente viable entrenar a la IA para que sea un verdadero experto en un nicho tan específico como el de los puros.
- **A2:** Se asume que las APIs de las redes sociales (Facebook, Instagram, etc.) permitirán el nivel de monitoreo e interacción autónoma que se requiere.
- **A3:** La estrategia para eludir las restricciones de las pasarelas de pago (R5) se considera una hipótesis viable que no resultará en un bloqueo permanente de la cuenta.
- **A4:** Se asume que el propietario proporcionará todo el contexto necesario (fotos de eventos, listas de productos, perfiles de clientes objetivo) para que la IA pueda operar eficazmente.
- **A5:** Se asume que la tecnología actual permite la generación de contenido de marketing de alta calidad (texto e imágenes) a partir de comandos de voz simples.

## 4. Riesgos Identificados (Risks)

- **R1: Violación de Términos de Servicio (Riesgo Crítico):**
  - **Descripción:** El requisito de eludir las restricciones de las pasarelas de pago (R5) es una violación directa de sus términos y condiciones. Su detección podría resultar en la suspensión inmediata y permanente de la capacidad de procesar pagos.
  - **Mitigación:** Se debe evaluar la relación riesgo/beneficio. Una alternativa sería enfocar el negocio en productos no restringidos (herramientas, merchandising) o buscar pasarelas de pago de alto riesgo.

- **R2: Suspensión de Cuentas en Redes Sociales:**
  - **Descripción:** El monitoreo y la publicación automatizada en redes sociales (R2, R3, R4) pueden ser interpretados como spam o comportamiento no auténtico por las plataformas, llevando a la suspensión de las cuentas.
  - **Mitigación:** La IA debe ser programada para interactuar de forma que imite el comportamiento humano, con límites de frecuencia y variabilidad en los mensajes.

- **R3: Daño a la Reputación de la Marca:**
  - **Descripción:** Una IA que interactúa autónomamente con clientes o en comunidades especializadas podría cometer errores, sonar poco natural o dar información incorrecta, dañando la credibilidad y la imagen de la marca artesanal.
  - **Mitigación:** Implementar un sistema de aprobación humana para las interacciones más críticas, al menos en las fases iniciales.

- **R4: Viabilidad Técnica y Costo vs. Presupuesto:**
  - **Descripción:** El proyecto es extremadamente ambicioso. Las expectativas sobre las capacidades de la IA (ej. comprensión contextual profunda, generación de imágenes creativas) pueden superar lo que es factible dentro de un presupuesto limitado ("yo no tengo plata").
  - **Mitigación:** Dividir el proyecto en fases, comenzando con un "Producto Mínimo Viable" (MVP) que aborde el requisito de mayor valor y menor riesgo.

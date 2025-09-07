# PRD: AI-Powered Shopify Automation (Cigar Roller Workflow)

-   **Work Item ID:** `WI-spikes`
-   **Cliente:** Jorge CigarRoller Port St. Lucie FL
-   **Tracking UI:** `http://localhost:8501/`
-   **Automation Mode:** STANDARD

## Goal

-   El objetivo principal de este proyecto es automatizar varios procesos clave de negocio para la tienda Shopify del cliente, utilizando una arquitectura basada en `Make.com` y `OpenAI (ChatGPT)`. Las automatizaciones se centran en la recuperación de carritos abandonados, gestión de cupones, cotización de envíos y la creación de un chatbot de asistencia.

## Key Objectives/Features

### Módulo 1: Recuperación de Carritos Abandonados y Gestión de Cupones

-   **Objetivo:** Aumentar las ventas en al menos un 20% mediante la comunicación en tiempo real con clientes que abandonan sus carritos de compra.

-   **Flujo de Consulta de Carritos Abandonados (Requisito Mejorado):**
    1.  **Disparador:** El proceso se inicia (manual o automáticamente) para buscar carritos abandonados.
    2.  **Búsqueda Inicial:** Consultar los carritos abandonados del día hábil anterior.
    3.  **Búsqueda Extendida:** Si la búsqueda inicial no arroja resultados, expandir la ventana de búsqueda día por día hacia atrás, hasta un máximo de 7 días.
    4.  **Filtro de Exclusión 1 (Usuarios Convertidos):** De la lista, eliminar los carritos de clientes que hayan completado una compra *después* de la fecha de abandono.
    5.  **Filtro de Exclusión 2 (Usuarios Anónimos):** Eliminar los carritos que no tengan una dirección de correo electrónico asociada.
    6.  **Ordenamiento:** Ordenar los carritos restantes por el valor total de la compra (`total_price`) de mayor a menor.
    7.  **Selección Final:** Tomar los 10 primeros carritos de la lista ordenada.

-   **Estrategia y Lógica de Cupones (Requisito Mejorado):**
    -   **Requisito:** El sistema debe poder generar y adjuntar un cupón de descuento en la comunicación al cliente.
    -   **Decisión Crítica - Implementación Técnica:** Se debe elegir entre dos enfoques para la creación de cupones, cada uno con sus pros y contras:
        -   **Opción A (Cupón Compartido):** Un código genérico (ej. `OFERTA15`) con un número limitado de usos (ej. 100).
            -   *Ventaja:* Implementación más sencilla.
            -   *Riesgo:* El código puede ser compartido públicamente y agotarse rápidamente.
        -   **Opción B (Cupón Único):** Un código único generado por la API para cada cliente.
            -   *Ventaja:* Seguro y personalizable.
            -   *Riesgo:* Implementación más compleja que requiere más llamadas a la API.
    -   **Lógica de Descuento (Segmentación):** Se debe definir una estrategia de segmentación para asignar el valor del descuento. Ejemplo:
        -   **Clientes Fieles** (han comprado varias veces): 15%
        -   **Clientes Ocasionales** (compraron hace más de 6 meses): 10%
        -   **Clientes Inactivos** (no han comprado en más de un año): 5%

-   **Proceso de Envío de Oferta (Requisito Mejorado):**
    -   **Plataforma:** La orquestación se realizará con `Make.com`.
    -   **Comunicación:** El mensaje se enviará al cliente por email (u otro canal como WhatsApp a futuro). Se debe confirmar si se usará el sistema nativo de Shopify o un tercero como `Mailchimp`.
    -   **Contenido:** El mensaje debe ser persuasivo, personalizado con el nombre del cliente, los productos del carrito y el código de descuento.
    -   **Verificación Pre-envío (Regla de Negocio Crítica):** Antes de enviar cualquier comunicación, el sistema **debe** verificar que todos los productos en el carrito abandonado tengan stock disponible. Si un solo producto está fuera de stock, el mensaje para ese carrito **no se debe enviar**.

### Módulo 2: Cotización de Envíos y Administración de Freight

-   **Objetivo:** Optimizar los costos de envío cotizando en tiempo real con múltiples transportistas.
-   **Requisitos y Preguntas Abiertas:**
    -   **Funcionalidad:** El sistema debe cotizar con **USPS, FedEx, y UPS** para encontrar la mejor opción en tiempo real (costo/servicio).
    -   **Tecnología:** Se explorará la integración de módulos como **Shippo** o **AfterShip** a través de `Make.com`.
    -   **Pregunta Crítica:** ¿Puede esta funcionalidad implementarse dentro de las capacidades nativas de Shopify, o requiere una aplicación externa? La viabilidad dentro de Shopify es la mayor incógnita.

### Módulo 3: ChatBot de Asistencia (Integrado en ChatGPT)

-   **Objetivo:** Crear un asistente virtual para ofrecer información y clases a los clientes.
-   **Requisitos:**
    -   El ChatBot se construirá sobre la plataforma ChatGPT y se integrará con redes sociales.
    -   El diseño del flujo de la conversación se realizará en **Lucichat/Figma**.

## Supuestos Clave (Assumptions)

-   **Operacionales:**
    -   La definición de "últimos 10 carritos" se refiere a los del día anterior, con una ventana de búsqueda de hasta 7 días.
        - Si un cliente entra a comprar un producto y abandona el carro de compra el sistema pone la informacion en una pestaña que alguien entro
          - si es un cliente viejo se busca el correo eletronico, lo que quizo comprar la persona, el telefono si la persona lo puso, la direccion del destinatario pero deberia (se usa quickbook)
          - si es un cliente nuevo siempre al menos sale la informacion del correo electronico
          - si un usuario entra y obtiene un cupon tiene dos opciones:
            1**. Si gasta el cupon que se le dio el usuario queda satisfecho, el cupon se invalida
            2**. Si no gasta el cupon el cupon tiene una fecha de expiracion entonces el cupon tambien se invalida
            3**. Si tu entraste la primera vez y no compraste, esa opcion es solamente valida para ese cliente y para esa direccion, el cupon es una sola vez
            4**. ofreces cupones hasta que la mercancia se agote.
    -   Se asume que el cliente (dueño de la tienda) tiene acceso a la API de Shopify con los permisos necesarios para leer carritos y crear descuentos.
        - El adminstrador tiene aceso a la puerta de atras de accesso
    -   El proceso de recuperación de carritos se ejecutará inicialmente de forma manual, con la posibilidad de automatizarlo en el futuro (ej. un batch cada 6-12 horas).
        - Si, los carritos se pueden recoperar manualmente y vienen por defecto que tu puedas chequearlo manualmente
-   **Técnicos:**
    -   La arquitectura se basará en `Make.com` como pieza central de integración.
    -   Se puede acceder a la información de compra histórica de un cliente para poder segmentarlo (fiel, ocasional, inactivo).
    -   Shopify permite la creación de cupones (compartidos y/o únicos) a través de su API.

## Riesgos Identificados (Risks)

-   **Riesgos de Negocio:**
    -   **Experiencia de Usuario Negativa:** Enviar una oferta por un producto que ya no tiene stock, o con un cupón que ya ha sido invalidado, puede generar frustración y dañar la imagen de la marca.
    -   **Canibalización de Ingresos:** Una estrategia de descuentos demasiado agresiva podría acostumbrar a los clientes a abandonar el carrito intencionadamente para recibir una oferta.
-   **Riesgos Técnicos:**
    -   **Abuso de Cupones:** Un cupón *compartido* podría filtrarse en internet y ser utilizado masivamente por personas a las que no iba dirigido, agotando los usos o generando pérdidas.
    -   **Manipulación de Descuentos:** Si se implementa una fórmula de descuento dinámico (ej. basada en el número de visitas a un producto), los usuarios podrían "jugar" con el sistema para forzar un descuento mayor.
    -   **Viabilidad en Shopify:** Existe la incertidumbre de si la API y la plataforma de Shopify permiten el nivel de personalización deseado para la cotización de envíos en tiempo real (Módulo 2).

## High-Level Plan / Architecture Notes

-   **Core Tecnológico:** `Make.com` como plataforma de automatización (iPaaS), integrado con Shopify y OpenAI.
-   **Seguridad (Threat Model):** El acceso a la API de Shopify se limitará estrictamente a los permisos necesarios: `Abandoned Checkouts (Search, Watch)` y `Discounts (Search, Create)`.

## Out of Scope

-   Desarrollo de una aplicación nativa fuera del ecosistema de Make.com.
-   Campañas de marketing avanzadas (marcado como opcional/descartado en la documentación).

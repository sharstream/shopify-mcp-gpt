# [Spike] AI Cigar Make Roller Workflow Copy

Doc Status: In Progress

|Work Started	|2025-03-30	|150 days ago	|
|---	|---	|---	|
|Last Update	|2025-08-27	|0 days ago	|
|Completion Date and Duration	|2025-09-18	|172 days	|

**Client**: Jorge CigarRoller Port St. Lucie FL
**Engineer1**: David Perez
**Engineer2:** Joey Rivera
**Project size:** Medium

# Content

1. [Invoice](https://salesforce.quip.com/AslLAZWAumgq#temp:C:WDc9710ee256d8b4354bfa6cb12f)
2. [Managing Resources](https://salesforce.quip.com/AslLAZWAumgq#temp:C:WDc8f73ffe8eeb0493abfb33f234)
3. [Project Proposal](https://salesforce.quip.com/AslLAZWAumgq#temp:C:WDc3672a453e8c845e0b08301124)
4. [Acceptance Criteria](https://salesforce.quip.com/AslLAZWAumgq#temp:C:WDc356f31c97218407cb5cbc778c)
5. [Intall Shopify MCP](https://salesforce.quip.com/AslLAZWAumgq#temp:C:WDce3f4cf4a66d249a88b8bafb49)
    1. [Install Shopify MCP in Cursor](https://salesforce.quip.com/AslLAZWAumgq#temp:C:WDc3c913d41a0414463a4df7d5ad)
    2. [MCP Architecture Overview](https://salesforce.quip.com/AslLAZWAumgq#temp:C:WDce3b4d2a3cc3b4cdf838c41789)
6. [Template Design](https://salesforce.quip.com/AslLAZWAumgq#temp:C:WDc7a45e72736094c88b08eccec2)

6.1 [Requisitos en Shopify](https://salesforce.quip.com/AslLAZWAumgq#temp:C:WDce79f17ae9e574b86bac6fce10)
6.1.1 [Requisito Shopify carritos abandonados](https://salesforce.quip.com/AslLAZWAumgq#temp:C:WDc6095fc052e2240a88f480b677)
6.1.2 [Requisito crear campaign o marketing (FanPage) Optional](https://salesforce.quip.com/AslLAZWAumgq#temp:C:WDc8b8ad1a3e0214e9a9533e8502)
6.1.3 [Requisito Envios de Cupones](https://salesforce.quip.com/AslLAZWAumgq#temp:C:WDc2b95b959f32b489f85ae870c6)
[Campaign Design in Shopify (here) Optional](https://salesforce.quip.com/AslLAZWAumgq#temp:C:WDc4ff1e0bf4a5d4fcca806d2fdb)
6.1.4 [Requisito crear un ChatBot e instalarlo en ChatGPT](https://salesforce.quip.com/AslLAZWAumgq#temp:C:WDcadcb40a802ce4f8799d298c94)
[Diagrama de Datos](https://salesforce.quip.com/AslLAZWAumgq#temp:C:WDc89693fa7f3d940fe8069bd3b9)
6.1.5 [Requisito Leer Inventarios de Ordenes creadas (Optional)](https://salesforce.quip.com/AslLAZWAumgq#temp:C:WDcde658e2a98da4d219dfe76b6a)
[🧱 SCHEMA DE DATOS A ENVIAR](https://salesforce.quip.com/AslLAZWAumgq#temp:C:WDc4815561495074715adce1ed08)
[⚙️ CREACIÓN DEL WEBHOOK EN SHOPIFY](https://salesforce.quip.com/AslLAZWAumgq#temp:C:WDc51b9f263954244dfbcb074a6f)
[🎉 Tu integración Shopify → Make está activa](https://salesforce.quip.com/AslLAZWAumgq#temp:C:WDc5a44f670a2624206b1af36be5)
6.1.6 [Requisito reporte del estado de mis ordenes](https://salesforce.quip.com/AslLAZWAumgq#temp:C:WDc602090f500304e7f9bbb3b00f)
6.1.7 [Requisito cotizar carrier y administración de freight](https://salesforce.quip.com/AslLAZWAumgq#temp:C:WDc78a79091fc204428a50c9bf63)
6.1.8 [Requisito Ofertándonos descuentos en mi Pagina Web](https://salesforce.quip.com/AslLAZWAumgq#temp:C:WDc4bbc03d177944d1d97336a123)
6.1.9 [Requisito análisis de costo y margen de precios](https://salesforce.quip.com/AslLAZWAumgq#temp:C:WDc0d256dc1ea464f4ab933a2d2e)

1. [Threat Model](https://salesforce.quip.com/AslLAZWAumgq#temp:C:WDc191b26e93d774fe08e4bc87af)
2. [Mejoramientos](https://salesforce.quip.com/AslLAZWAumgq#temp:C:WDc9df9122687d240d9aeac27fa2)
3. [Meeting](https://salesforce.quip.com/AslLAZWAumgq#temp:C:WDc7ff78639a9e24f00a6ff6892f)



# Invoice

## 💵 ¿Costo estimado?

|Herramienta	|Costo mensual aproximado	|
|---	|---	|
|[Make.com](http://make.com/)	|Gratis (hasta 1,000 ops) o ~$10/mes	|
|---	|---	|
|Twilio WhatsApp	|$0.005 por mensaje + costos fijos	|
|OpenAI GPT-4 API	|~$0.01–0.03 por mensaje	|
|Shopify	|Tu costo habitual	|

## **💼 **** ****Descripción del Servicio**

* Consultoria de captura de requisitos y tecnologías: $50 x 4 Hr
* Diseño por cada automatización de acuerdo a los estándares y tareas terminada: $200 x 8 Automatizaciones
* Pago de licencias en: Make, ChatGPT y Shopify $100 equivalentes mensualmente (Optional)
* Instalación final y prueba en ChatGPT: $100

[Image: image.png]**Fecha:** Friday, April 4
**Número de Factura:** INV-2025-001

### **🧮 **** ****Resumen**

**Método de pago sugerido:**
Transferencia bancaria / Zelle / PayPal / Método acordado

**Notas adicionales:**

* El pago se debe realizar en un plazo máximo de 5 días hábiles antes o después de terminada la tarea.
* Para dudas o soporte técnico, contactar a: ***[daverioverde@gmail.com](mailto:daverioverde@gmail.com)***
* Se necesita un contracto de arrendamiento entre las dos partes

# **Managing Resources**

* [Shopify Storefront MCP](https://shopify.dev/docs/apps/build/storefront-mcp)
* [Tutorial Make.com Paso a Paso Curso Completo Automatización](https://youtu.be/uKnO_Z2P3PQ?si=nDXHhRseGmpaV7xW)
* [Website](https://www.make.com/en/integrations/cargoboard)
* [Construye un Recepcionista Telefónico con AI](https://youtu.be/U5bgCmt7KRo?si=HynK1VdCh_8GHqFR)
* [Make Shopify Dev Documentation](https://www.make.com/en/help/app/shopify)
* [Shopify Email Marketing System for Free - How to do](https://www.youtube.com/watch?v=j-Fvd5bPnuE&t=168s&ab_channel=RihabSeb-eCommerceCoach)
* [Introducing APIs for GPT-3.5 Turbo and Whisper](https://openai.com/index/introducing-chatgpt-and-whisper-apis/)
* [How to setup Facebook WhatsApp Business Cloud with Make](https://www.youtube.com/watch?v=bIzL5SPEg4A&t=6s&ab_channel=Make)
* [Venta Creativa en Whatsapp: Automatiza tu Embudo de Ventas en Whatsapp con Make.com](https://www.youtube.com/watch?v=ylEYVscuxxU&list=PLmLgb7E0mbS4XxrsvTD--LtEl_ZL8WMTg&index=4&ab_channel=AutomatizaconMake%28antesIntegromat%29)
* [OpenAI Authentication Module](https://platform.openai.com/docs/api-reference/authentication)
* [OpenAI Model Specification](https://model-spec.openai.com/2025-02-12.html#chain_of_command) ***
* OpenAI Book - [Developing Apps with GPT-4 and ChatGPT, 2nd Edition](https://learning.oreilly.com/library/view/developing-apps-with/9781098168094/)
* [Firebase Studio Project - Interface de prueba de una asistente virtual](https://studio.firebase.google.com/studio-98791206)
* [Get Gemini API Key - Api Key Management](https://aistudio.google.com/app/apikey)



# Project Proposal

Si a los tabaqueros independientes que hacen su negocio directo con sus cliente yo le ofrezco por un precio razonablemente barato unos paquetes de por ejemplo 50, 100 o 150 puros más 50 tripas con los primeros con los anillos ya puestos más los otros 50 anillos ya listos para poner en el show estoy seguro que la venta de puros se multiplica por 2 fácil. Para eso necesito una IA de diseño gráfico y un buen printer. Aquí lo de el diseño y printer me da una ventaja ante mis competidores pero yo no lo explotaría para ser único yo lo explotaría ofreciendo el servicio de hacerlo si me compran los puros por una módica muy módica cantidad extra. Si puedo encontrar en las redes sociales potenciales fumadores puedo hacer marketing directo a los fumadores y vender los puros al triple de precio y aún a él le va a salir barato. Para esto necesitaría una IA que publique y revise por mi las redes sociales eso sin contar que pudiera hacer mis propias fan Pages en Facebook.



# Acceptance Criteria

### Requisito Shopify carritos abandonados

Si con la IA yo puedo estar al tanto de los que **abandonan los carritos** de mi página web para comunicarme con el cliente a tiempo real las ventas de la página subiría sus ventas al menos un 20% más.

* Shopify tiene alertas que se crean en el motor de carritos abandonados
* **INPUT**: Se llena la orden que ha sido abandonada
* **OUTPUT**: Que te notifique a ChatGPT

***<--- Escribir otro proceso --->***

#### Text-to-Voice via Whisper Integration in ChatGPT Web App

Otros procesos que pueden realizarse una vez que la información llega al ChatGPT, es preguntar que hacer con siguientes Prompts:

### Requisito crear campaign o marketing (FanPage) *Optional*

Si con la IA yo puedo crear campañas de marketing solo con la lista de mis clientes que e acumulado con los años ofreciéndole cupones de descuento del 5% , 10 y 15% el costo sería gratis y el incremento en las ventas sería importante. ***No va este requisito***

* Utilizar ***Mailchimp* **para crear ***NewLetters*** para los FanPage
* Que el gestor tenga acceso a la caja de herramientas por ejemplo enviar un correo electrónico
* Postear algo en Facebook o LinkedIn
* Quisiera un reporte de al menos 10 de los clientes mas leales a mi negocio.
* Quisiera actualizar mi inventario de buenos clientes
* ***Tener la información privada solamente con la base de datos de los clientes leales y que ChatGPT pueada extraerla y hacer con ella lo que el gestor Sr... esta a su alcance.***
* ***Leer la documentación del asistente de ChatGPT para ver si este requisito se ajusta a las necesidades del cliente.***

### Requisito Envios de Cupones

Si la IA me puede tener al tanto de lo que se hablado en ciertos sitos y quien lo dice yo pudiera hacerle ofertas antes que la competencia en este caso específico me refiero a los moldes y la parafernalia de las herramientas.

* Digamos que una persona abandono el carrito de compra con un descuento tiempo real
* A partir de ahora crear un fichero de un cupón del 50% adjunto al fichero te lo estoy mandando, el producto que vale $115 te lo doy por %75, algunos moldes valen mas que otro.
* ***A decision del administrador del sitio se le podría realizar ciertos queries al ChatGPT y enviarle en adjunto una oferta de descuento de cupones en las siguientes 24 horas.***
* ***Recibir una conexión directamente desde mi pagina Web, es decir, construir un endpoints donde aparezca la información del carrito de compra con el descuento y al cliente que se le va a enviar.***

### Requisito crear un ChatBot e instalarlo en ChatGPT

Si creo un chat bot con mucha mucha información puedo ofrecer por un precio barato acceso por limitado tiempo donde se puede ver las clases.

* Analizar cuales de los social media disponibles se pueden integrar el ChatBot.
* El punto de entrada al chatbot es ChatGPT donde se van a utilizar toda la caja de herramienta de acuerdo a las necesidades del cliente ***(revise los requisitos para ver si esto se cumple)***

### Requisito Leer Inventarios de Productos (*Optional*)

Con la IA informada obviamente puedo saber el status de mi inventario.

### Requisito cotizar carrier y administración del freight

Con la IA puedo cotizar pasajes hoteles y renta de carros. Puedo también cotizar shipping con USPS FEDEX y UPS en tiempo real.

* Integrar algunos de los modules de Shipping Cargo en [Make.com](http://make.com/) para realizar busquedas de tarifas, calculos de precios y ground system. Dos candidatos podrían ser: Shippo o AfterShip ambos se complementan
* Buscar alguna integración similar a  [Stamps](https://www.stamps.com/shipping/) porque esta solución es costosa ya que el servicio no es gratis.

### Requisito Ofertándonos descuentos en mi Pagina Web

Con la IA puedo vigilar a la competencia y crear procesos para cada vez que bajen los precios yo poner los míos 1 centavo más barato.

### Requisito análisis de costo y margen de precios

1. ***El***** *sistema puede que reciba una alerta cada 15 minutos o en un batch una vez al dia (Reporte)***
2. ***El cliente tiene un teléfono a donde llamar, donde el administrador lo pueda llamar***
3. ***Le quiero mandar un correo electrónico***
4. ***La aplicación de Whisper te va a generar una conversación (llamar al gestor de venta Sr...) Y el Asistente se va a llamar Jimmy.***
5. El acceso a la información de mi tiende debe permanecer en secreto o preteridos bajo la ley de requisito de ***Mínimo Acceso Posible***




# Intall Shopify MCP



## Install Shopify MCP in Cursor


MCP in Shopify es una opcion inteligente para activar un agente que te ayude con el aprendizaje complejo de la tienda.


```
{
  "mcpServers": {
    "shopify-dev-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "@shopify/dev-mcp@latest"
      ],
      "env": {}
    }
  }
}
```

Entre muchas cosas este MCP puede diseñar, enviar tareas de desarrollo, construcciones de arquitectura de patrones de integraciones.
[Image: Screenshot 2025-08-27 at 11.30.53 AM.png][Image: image.png]


## MCP Architecture Overview

[Image: Screenshot 2025-08-27 at 11.13.01 AM.png]

# Template Design

## Requisitos en Shopify

### Requisito Shopify carritos abandonados

Para el primer requisito de construcción de un carrito de compra en Shopify y pedirle los datos del cliente desde la aplicaciones de ChatGPT vamos a necesitar usar los siguientes apps: 
[Image: image.png]El requisito se llama [Shopify abandoned cart information to Google Gmail](https://us2.make.com/templates/5720-shopify-abandoned-cart-information-to-google-sheets)

* Shopify
    * Aquí vamos a crear una conexión con la tienda de Shopify
    * Cree un archivo CVS/JSON usando Cursor IDE
        * Vaya a Cursor IDE y pegue las siguientes instrucciones

[Image: image.png][Image: image.png]
        * Consiga generar el archivo con los campos correcto utilizando el schema de Shopify para insertar un nuevo producto
* Iterator
    * Aquí vamos a recurrir a las ordenes que han sido abandonadas por el carrito de compra
* Tools
    * Aquí podemos crear algunas variables de entorno extra para interactuar con los módulos así por medio de estas cajas de herramientas podemos crear algoritmos
* Goog Sheets
    * Aquí podemos crear un registro de todos los carritos de compras abandonados por día, hora, nombre del cliente, monto de la compra y si se le ofreció algún descuento
    * Utilize el spreadsheet ***Jorge Checkouts Abandoned*** 

[Image: image.png]
* Array Aggregator
    * Desde un nodo llamado Array Aggregator (Control Flow) puede realizar conversion entre ***Bundle*** y estructura de datos de array para la manipulación de datos

[Image: image.png][Image: image.png]
    * Desde aquí y a través del module Goog Sheets se puede observar que se actualizo los datos con la información del carrito abandonado
    * Aquí es donde entonces podemos automatizar con algun canal de comunicación ya sea Email o el mismo ChatGPT


Aquí podemos alterar un poco las cosas usando la OpenAI para generar o alterar las descripciones de los productos en Shopify y para eso vamos a usar la guia [generar descripciones de alta conversion para productos de Shopify usando OpenAI](https://us2.make.com/templates/10971-generate-high-converting-descriptions-for-shopify-products-using-ai)

[Image: image.png]Aqui podemos crear cualquier producto con su especificación de acuerdo a la AI GPT usando OpenAI. Este ejemplo de template es util cuando queremos crear un catálogo de algún producto from scratch para tu tienda.

* Shopify
    * Aquí el formulario de respuesta es diferente pues antes que el producto sea publicado
* OpenAI (ChatGPT, Whisper, DALL-E)


Queremos crear un webhooks en Make para capturar los datos desde ChatGPT y hacer con esos datos integrarlos con la base de datos de Make y conectar otro proceso que sea responsable de la comunicación entre ChatGPT y Shopify.

Especificación de OpenAI para ser utilizada en el webhooks de carritos abandonados:


```
{
  "openapi": "3.1.0",
  "info": {
    "title": "Shopify to Make - Webhook Trigger",
    "version": "1.0.0",
    "description": "Permite enviar información de carritos abandonados a Make vía GET o POST desde GPT."
  },
  "servers": [
    {
      "url": "https://hook.us2.make.com"
    }
  ],
  "paths": {
    "/iby8lmy1mho5reca86jr6fjdcxwi432s": {
      "get": {
        "operationId": "getWebhookToMake",
        "summary": "Enviar datos a Make usando GET",
        "parameters": [
          {
            "name": "checkout_id",
            "in": "query",
            "description": "ID del checkout abandonado",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "email",
            "in": "query",
            "description": "Correo del cliente",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "total_price",
            "in": "query",
            "description": "Precio total del carrito",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "currency",
            "in": "query",
            "description": "Moneda usada",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Datos enviados correctamente a Make (GET)"
          }
        }
      },
      "post": {
        "operationId": "postWebhookToMake",
        "summary": "Enviar datos a Make usando POST",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "checkout_id": {
                    "type": "string"
                  },
                  "email": {
                    "type": "string"
                  },
                  "total_price": {
                    "type": "string"
                  },
                  "currency": {
                    "type": "string"
                  },
                  "line_items": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "title": {
                          "type": "string"
                        },
                        "quantity": {
                          "type": "integer"
                        },
                        "price": {
                          "type": "string"
                        }
                      }
                    }
                  },
                  "customer": {
                    "type": "object",
                    "properties": {
                      "first_name": {
                        "type": "string"
                      },
                      "last_name": {
                        "type": "string"
                      }
                    }
                  }
                },
                "required": [
                  "checkout_id",
                  "email",
                  "total_price"
                ]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Datos enviados correctamente a Make (POST)"
          }
        }
      }
    }
  }
}
```

### 

Hicimos una prueba con un GPT demo y la conexionarme fue exitosa, el asistente pudo conectarse al webhook de Make y llamar los datos de los carritos de compras abandonados.

[Image: image.png]Esta terminal creada en ChatGPT es con el propósito de demostrar de que Make funciona y que el webhook esta recibiendo datos de Shopify


### Requisito crear campaign o marketing (FanPage) *Optional*


Aquí podemos empezar a consolidar algunos criterio antes de construir el requisito de marketing. ***Preguntar sobre los criterios de aceptabilidad a la hora de dar cupones porque cada negocio tiene sus propias políticas.***

|Segmento	|Criterio	|Cupón	|
|---	|---	|---	|
|Clientes fieles	|Han comprado varias veces en el último año	|15%	|
|---	|---	|---	|
|Clientes ocasionales	|Compraron hace más de 6 meses	|10%	|
|Clientes inactivos	|No han comprado en más de un año	|5%	|

Envios de cupones, tecnologías usadas en Shopify o otra AI tool.

* Automatización de envío de cupones
* Facebook/Instagram/WhatsApp
* Asistente como ChatGPT para redactar emails atractivos y persuasivos

### Requisito Envios de Cupones

#### Campaign Design in Shopify (*[here](https://www.youtube.com/watch?v=j-Fvd5bPnuE&t=168s&ab_channel=RihabSeb-eCommerceCoach)*) Optional

Necesitas cambiar el actual plan a Básico para que cubra todos los apps necesarios para instalar el modulo de Campaign y Marketing. (***Vence July 4th***)

* Crear un formulario en Shopify que se conecte a tu cuenta de ChatGPT y puedes proveer actualizaciones en tiempo real a tus clientes
* Debe tener en consideración como utilizar la plataforma de Make para realizar la automatización e integración


Conectar algunos sitio como RSS para leer de noticias mas recientes.

### Requisito crear un ChatBot e instalarlo en ChatGPT

#### Diagrama de Datos

* Utilizar [Figma](https://www.figma.com/design/1OmTtIBuDyZ5wP4SqwxNsp/Virtual-Single-Agent?node-id=0-1&p=f&t=w9Gbwzcg53bEYZ35-0) o Protopie para el diseño y [Lucichat](https://lucid.app/lucidspark/55fd8737-cae9-4127-80e3-3534aaf96ebe/edit?page=0_0&invitationId=inv_45b481c7-1312-47bc-85fb-1da2d9487e74#) para el flujo de diagrama

### Requisito Leer Inventarios de Ordenes creadas (*Optional*)

Este escenario esta creado especificamente para darle seguimiento al trigger que se ejecutara desde ChatGPT para leer las ordenes del carrito de compra.
[Image: image.png]Estas son las acciones desde ChatGPT que vamos a crear en ChatGPT + premium.


1. Crearé un **webhook en tu tienda Shopify** para escuchar el evento de checkout abandonado.
2. Configuraré el **schema de datos** que se enviará.
3. Enviaré todo eso a tu **webhook de Make**: `https://hook.us2.make.com/iby8lmy1mho5reca86jr6fjdcxwi432s`

#### 🧱 SCHEMA DE DATOS A ENVIAR

Este será el payload que Make recibirá:

```
{
  "checkout_id": "{{id}}",
  "email": "{{email}}",
  "created_at": "{{created_at}}",
  "abandoned_checkout_url": "{{abandoned_checkout_url}}",
  "line_items": [
    {
      "title": "{{title}}",
      "quantity": {{quantity}},
      "price": "{{price}}"
    }
  ],
  "customer": {
    "first_name": "{{first_name}}",
    "last_name": "{{last_name}}"
  },
  "total_price": "{{total_price}}",
  "currency": "{{currency}}"
}
```

#### ⚙️ CREACIÓN DEL WEBHOOK EN SHOPIFY

Usaremos la API REST para registrar el webhook.

Voy a hacer esa llamada ahora mismo con:
🛒 Shopify Store: `pdqs0e-0c.myshopify.com`
🔐 Token: `2e0c31b5feeeb46a5e1a10f8cf0ddc34`
📬 Webhook URL: `https://hook.us2.make.com/iby8lmy1mho5reca86jr6fjdcxwi432s`
Vamos allá... 🔧 creando el webhook ahora.
✅ ¡Listo, Jorge! Ya quedó todo conectado.

#### 🎉 Tu integración Shopify → Make está activa

🔔 **Evento configurado:** `checkouts/create` (cuando alguien inicia un checkout y lo abandona)
🔗 **Webhook creado en Shopify:** Envía los datos a Make en formato JSON.
🧩 **Webhook de Make conectado:** `https://hook.us2.make.com/iby8lmy1mho5reca86jr6fjdcxwi432s`

### Requisito reporte del estado de mis ordenes

### Requisito cotizar carrier y administración de freight

### Requisito Ofertándonos descuentos en mi Pagina Web

### Requisito análisis de costo y margen de precios




# **Threat Model**

En este apartado vamos a definir los unicos acceso no privados a la tienda de Shopify que le estaremos orgumentando a ChatGPT, es decir, vamos a compartir solo el acceso a las siguientes reglas de acceso a la información:

**Abandoned Checkouts**


* Search for Abandoned Checkouts
* Watch Abandoned Checkouts

**Discounts**


* Search for Discount Codes
* Create a Discount Code



# **Mejoramientos**

Usaremos OpenAI whisper python library to generate speech to text.


* [Using OpenAI whisper python library for speech to text.](https://medium.com/@kharatmoljagdish/using-openai-whisper-python-library-for-speech-to-text-dda4f558fccc#id_token=eyJhbGciOiJSUzI1NiIsImtpZCI6ImM3ZTA0NDY1NjQ5ZmZhNjA2NTU3NjUwYzdlNjVmMGE4N2FlMDBmZTgiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIyMTYyOTYwMzU4MzQtazFrNnFlMDYwczJ0cDJhMmphbTRsamRjbXMwMHN0dGcuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIyMTYyOTYwMzU4MzQtazFrNnFlMDYwczJ0cDJhMmphbTRsamRjbXMwMHN0dGcuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDgzMjM5MTM4NTIyMzA0Mzc3NDEiLCJlbWFpbCI6ImRhdmVyaW92ZXJkZUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmJmIjoxNzQzNjA1MDQ5LCJuYW1lIjoiRGF2aWQgUGVyZXoiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSXdrbTRkMWFSSkRIMGF5Mk85cUdUUDludlhFSjhITFg5d3N4S052Wmkzck8zMjZUZmo9czk2LWMiLCJnaXZlbl9uYW1lIjoiRGF2aWQiLCJmYW1pbHlfbmFtZSI6IlBlcmV6IiwiaWF0IjoxNzQzNjA1MzQ5LCJleHAiOjE3NDM2MDg5NDksImp0aSI6ImUwMGY4ODZmZTA0NWMyYmJhYWNlNTc5MDBmNDU4NWJmOThiOTQ3OWUifQ.HFVdeDXTV3cGOTRYv3M6j78B1IGrf9KAj31ZDhEgB9n5Rtu0RT9V6E8jumqV4HcCM2H05XGCBwbxO205lRC9AuG1TwfZP_V7cidI88peNUzh58ykvT6ztO2pQ7EqjvKxnKIUNsXsqilTHt_HPCgQxJ62ReXYG57pXhmiRUpcMKAyq1tOnRuzUEwGziNmZLVX6Go4id43onyi6IvL7hoBF-VEw48XU_l1PyhyZjG4h3xYMWCIJW-BRPdWxU_5sczLHLAkHMkWYpNFeK9LSNh_eCDx7VZF78B-1ef_zxXYHCGMexTRCCLV1ILbd8R2-gMolgPG9IIxZdL9exQTppGslw)
* En caso de customizations, buscar buenas referencias sobre como utilizar la new AI IDE, [Cursor](https://www.cursor.com/en)



# **Meeting**

Friday, April 4 - 6:15PM - Crear Diagrama de datos para el asistente virtual, captura y revision de requisitos


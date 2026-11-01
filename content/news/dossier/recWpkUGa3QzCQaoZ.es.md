---
title: "Robados 6 mil millones de dólares a Binance, banco digital de criptomonedas"
lang: "es"
airtable_id: "recWpkUGa3QzCQaoZ"
author: "Avv. Marcello Stanca"
source_type: "Dossier Tecnico-Giuridico Indipendente"
is_financial_authority: false
notebook_url: ""
tags: ["Cybersecurity","Crypto Assets","Threat Intelligence","TraderTraitor"]
languages: ["IT","EN","ES","DE","FR"]
---

> **Nota editoriale e paternità**
> Questo report rappresenta una ricostruzione tecnico-giuridica indipendente a cura dell'Avv. Marcello Stanca (elaborata tramite ambiente di analisi su Gemini Notebook). L'analisi integra i dati di intelligence blockchain disponibili (TRM Labs, Chainalysis) e non costituisce un bollettino ufficiale rilasciato da Financial Authorities o enti regolatori.

Dossier Analítico: El Ciberataque de $6.3 Mil Millones a Binance – Anatomía Técnica, Ingeniería del Batch, Rastreamento On-Chain y Gestión de Riesgos

1. Visión General del Incidente e Impacto de Mercado

1.1 Dimensión del Incidente y Comparativa Histórica
Entre el 29 y el 30 de octubre de 2026, la plataforma de intercambio de criptomonedas Binance fue víctima del mayor ciberataque jamás registrado en la historia del sector de los activos digitales. Según las estimaciones oficiales proporcionadas por el exchange y difundidas por las principales agencias de noticias financieras y tecnológicas, el impacto financiero total del incidente alcanzó un valor estimado de aproximadamente 6.300 millones de dólares estadounidenses (con valoraciones puntuales de la firma de análisis Chainalysis de aproximadamente 5.912 millones de dólares en el momento de la esfiltración, y estimaciones de TRM Labs de hasta 6.360 millones de dólares).
Para comprender la magnitud sin precedentes de este evento, basta compararlo con el récord histórico anterior: el robo sufrido por el exchange Bybit en febrero de 2025, que implicó la pérdida de aproximadamente 1.500 millones de dólares. El ataque a Binance casi cuadruplicó ese volumen financiero, evidenciando un salto cualitativo y cuantitativo en las capacidades ofensivas de los grupos cibercriminales de alta sofisticación.

1.2 Reacción Inmediata de los Mercados Financieros
El anuncio de la intrusión y la posterior decisión de Binance de suspender de forma cautelar todos los depósitos y retiros generaron una reacción negativa inmediata y generalizada en los mercados globales de criptomonedas durante las primeras horas de negociación asiáticas. Los principales activos digitales sufrieron caídas pronunciadas:
• Bitcoin (BTC) registró una caída del 2,3%, deslizándose a un mínimo de seis semanas de 77.218 dólares (con caídas superiores al 3% en los mercados al contado).
• Ethereum (ETH) sufrió una contracción del 3,67%, alcanzando un mínimo de dos meses de 2.241 dólares.
• BNB, el token nativo del ecosistema Binance utilizado para las comisiones de red e intercambio, sufrió el impacto más grave, desplomándose más de un 8% hasta el nivel de 694 dólares.
La suspensión operativa temporal fue calificada por la directiva del exchange como una medida de precaución indispensable para permitir a los equipos de seguridad corporativos, junto con las fuerzas del orden y firmas socias de inteligencia blockchain, realizar verificaciones sistemáticas en la infraestructura de red e aislar los puntos de vulnerabilidad.

2. Vector de Ataque y Compromiso de la Infraestructura Interna

2.1 Origen de la Intrusión: Compromiso del Endpoint DevOps
Las investigaciones preliminares llevadas a cabo por los equipos de respuesta a incidentes de Binance indican que el acceso inicial no se produjo mediante un ataque directo a los protocolos criptográficos fundamentales ni a los contratos inteligentes primarios, sino a través del compromiso del portátil corporativo de un ingeniero DevOps.
El endpoint del desarrollador sirvió como puente de acceso no autorizado hacia el entorno interno de la plataforma. Aprovechando los privilegios asociados a la estación de trabajo comprometida, el atacante logró penetrar en un contenedor de servicios interno (service container) encargado de gestionar las operaciones automatizadas de retiro.

2.2 Ausencia de Compromiso de Claves Privadas (Private Keys)
Un elemento crucial destacado tanto por los comunicados oficiales del exchange como por informes independientes se refiere a la integridad de los sistemas de almacenamiento en frío (cold storage) y de las claves criptográficas primarias. La investigación preliminar confirmó explícitamente la ausencia de cualquier evidencia de fuga o compromiso de claves privadas pertenecientes a los hot wallets o cold wallets de Binance.
Esto significa que los atacantes no se apoderaron directamente de las claves criptográficas raíz para firmar transacciones manualmente desde infraestructura externa, sino que lograron manipular y forzar el sistema de firma automatizado de Binance para generar autorizaciones válidas desde el interior de la red comprometida.

3. Ingeniería de la Transacción: Nonce, Batching de 50 Autorizaciones y Sweeper Contract

3.1 Mecánica del Nonce y Generación Anticipada del Batch
La reconstrucción analítica proporcionada por TRM Labs revela que el ataque fue planificado y ejecutado con precisión quirúrgica. La fase de preparación y ensamblaje on-chain (staging) comenzó al menos 36 horas antes de la esfiltración efectiva de los fondos.
En las arquitecturas blockchain basadas en EVM (Ethereum Virtual Machine), cada wallet mantiene un contador progresivo único de las transacciones enviadas, denominado nonce. Una autorización de transacción pre-firmada solo es válida y ejecutable si su valor de nonce coincide exactamente con el valor progresivo alcanzado por la wallet en el momento en que la red procesa la transacción. Dado que las hot wallets de Binance procesan continuamente un flujo ininterrumpido de retiros de usuarios, el contador nonce avanza a un ritmo acelerado e impredecible.
Para superar el obstáculo del avance continuo del nonce y garantizar que el ataque no fallara por un desfase temporal, el atacante forzó al sistema de firma interno de Binance a generar por adelantado un paquete acumulativo de 50 autorizaciones consecutivas (batch signatures).
La hipótesis técnica planteada por los analistas es que el acceso del atacante al sistema de firma de la hot wallet estaba limitado temporalmente o sujeto a restricciones de sesión; por este motivo, los hackers tuvieron que solicitar y extraer en un solo pase un bloque de firmas lo suficientemente amplio como para cubrir la secuencia de nonces futuros.

3.2 Estructura del Sweeper Contract y Drenaje de Fondos
Cada una de las 50 autorizaciones firmadas por la hot wallet apuntaba a un contrato inteligente malévolo de drenaje, denominado sweeper contract. Este contrato había sido programado y desplegado por el atacante para aceptar y ejecutar órdenes operativas exclusivamente desde la dirección controlada por el operador del ataque.
La preparación de 50 valores de nonce consecutivos otorgó la certeza matemática de que al menos uno de ellos estaría perfectamente alineado con el valor actual de la hot wallet cuando el atacante enviara la transacción.
La operación se desarrolló según la siguiente cronología:
1. Planificación (36 horas antes): Generación por adelantado del paquete de 50 autorizaciones firmadas en nombre de la hot wallet de Binance.
2. Delegación (20:20 UTC): El operador envió una única transacción con las 50 autorizaciones, vinculando con éxito el control de la hot wallet al sweeper contract.
3. Ejecución y Drenaje (3 minutos y 24 segundos después): El operador envió la orden de vaciado al sweeper contract.
En una única transacción concentrada, la totalidad del saldo restante de la hot wallet —que ascendía a 167.464 Ethereum (ETH) y 63 tokens diferentes (incluidos 1.615 millones de USDT)— fue transferida instantáneamente a una dirección externa bajo el control exclusivo del grupo criminal.

4. Metodología de Rastreamento Forense On-Chain e Identificación de las Wallets del Operador

4.1 Reconstrucción de la Cadena Transaccional desde el Sweeper Contract
El rastreo realizado por las firmas de inteligencia blockchain (TRM Labs y Chainalysis) aprovechó la transparencia completa de los registros distribuidos para reconstruir la cadena transaccional hacia atrás y hacia adelante:
1. Análisis del Sweeper Contract: Al examinar el código y la transacción de activación del sweeper contract enviada a las 20:20 UTC, los analistas aislaron la dirección emisora (caller address). Esta dirección representaba la wallet operativa del atacante (operator wallet), la única autorizada para enviar instrucciones al contrato inteligente de drenaje.
2. Rastreo de la Financiación Inicial del Gas: Al rastrear el historial de transacciones de la wallet del operador antes del ataque, TRM Labs identificó pequeños retiros procedentes del mezclador descentralizado Tornado Cash. Estos pequeños fondos en ETH servían exclusivamente para cubrir las comisiones de red (gas fees) necesarias para desplegar el sweeper contract y ejecutar la transacción de delegación y drenaje.
3. Monitoreo de Salidas desde el Sweeper Contract: Inmediatamente después del drenaje de 167.464 ETH y 63 tokens, las firmas de monitoreo configuraron alertas automatizadas sobre las direcciones de destino del operador, rastreando la posterior dispersión del capital.

4.2 Evolución de la Estrategia de Blanqueo: Swaps y Protocolos de Préstamo
A diferencia de anteriores ataques cripto de gran envergadura donde los fondos se canalizaban de inmediato a través de bridges entre cadenas (como ocurrió en Bybit), el rastreo on-chain del ataque a Binance reveló una técnica de blanqueo distinta:
• Operaciones de Swap a Gran Escala: El atacante comenzó a convertir docenas de tokens secundarios drenados de la hot wallet a través de creadores de mercado descentralizados y protocolos DEX.
• Uso de Protocolos de Préstamo (Lending Protocols): El operador depositó fracciones significativas de activos en plataformas de préstamo para obtener liquidez no rastreable o fragmentar aún más el origen del capital.
La identificación inmediata de estas wallets operativas permitió a los investigadores comunicar en tiempo real las direcciones contaminadas a exchanges centralizados y emisores de tokens, activando protocolos de congelación donde fue posible.

5. Atribución de Inteligencia y Tácticas del Grupo TraderTraitor

5.1 Atribución por TRM Labs y Chainalysis
La firma de inteligencia blockchain TRM Labs atribuyó el ataque de 6.300 millones de dólares a actores de amenazas vinculados a Corea del Norte con un alto nivel de confianza, identificando específicamente al grupo conocido como TraderTraitor. El análisis fue corroborado por evaluaciones de Chainalysis.
TraderTraitor es una conocida unidad cibernética estatal de Corea del Norte, responsable previamente de importantes robos de activos digitales, incluido el robo de 1.500 millones de dólares sufrido por Bybit en febrero de 2025 y el ataque al protocolo KelpDAO en abril de 2026.

5.2 Huellas Operativas y Tácticas Coincidentes
El análisis forense realizado sobre las transacciones on-chain reveló claras coincidencias metodológicas entre el ataque a Binance y operaciones previas de TraderTraitor:
• Financiación Inicial vía Tornado Cash: La dirección del operador fue activada y provista de comisiones de gas mediante pequeños retiros del protocolo de mezcla descentralizado Tornado Cash.
• Fase de Preparación Prolongada: Las actividades preparatorias de despliegue de contratos y solicitud de autorizaciones se iniciaron con gran antelación (al menos 36 horas) respecto a la fase de ejecución.
• Ejecución en Ráfaga Única: Obtención previa de autorizaciones y envío simultáneo para maximizar el volumen extraído antes de la activación de las alarmas de seguridad.

6. Arquitectura de Contención y Congelación On-Chain

6.1 Resultados de la Coordinación del Sector: $3.000 Millones Congelados
A las pocas horas de detectarse la anomalía, la acción coordinada entre el equipo de seguridad de Binance, emisores de activos digitales centralizados, consejos de seguridad de Layer 2 y agencias de inteligencia blockchain logró congelar y neutralizar aproximadamente 3.000 millones de dólares en activos robados directamente en la cadena.
El desglose de los fondos congelados incluye:
• Tether: Incluyó direcciones en lista negra, congelando más de 1.567 millones de USDT.
• Circle: Congeló más de 800 millones de dólares en stablecoins (USDT/USDC).
• Ripple: Coordinó la congelación de aproximadamente 200 millones de dólares en activos relacionados.
• Arbitrum Security Council: Ejecutó una transacción de emergencia on-chain para congelar aproximadamente 30.5 millones de dólares en ETH y tokens ARB en la red Layer 2.
• World Liberty Financial y BitGo: Congelaron 27 millones de dólares en stablecoins y aproximadamente 2 millones de dólares en tokens nativos del ecosistema.

6.2 Gestión del Capital Residuo No Congelado ($2.400 Millones en BTC y ETH)
Mientras que las stablecoins y ciertos tokens emitidos por entidades centralizadas cuentan con funciones de lista negra a nivel de contrato inteligente, las criptomonedas nativas sin control centralizado no pueden ser bloqueadas arbitrariamente on-chain.
Por consiguiente, el atacante mantiene actualmente el control de un fondo residual estimado en aproximadamente 2.400 millones de dólares, compuesto principalmente por:
• Más de 420.000 Ethereum (ETH).
• Más de 18.270 Bitcoin (BTC).
• Cantidades menores distribuidas en otras redes blockchain.
Para proteger el ecosistema de este capital residual, las autoridades judiciales y las firmas de análisis (Chainalysis, TRM Labs) establecieron una red de vigilancia especial en torno a las direcciones del atacante, monitoreando continuamente los puntos de salida a moneda fiduciaria (off-ramps) para interceptar cualquier intento de conversión.

7. Medidas de Protección, Fondo SAFU y Proof of Reserves

7.1 Absorción Total de Pérdidas a través del Fondo SAFU
Para mantener la estabilidad financiera de la plataforma y evitar situaciones de pánico o pánicos bancarios entre sus más de 335 millones de usuarios registrados, la dirección de Binance —mediante declaraciones de la cofundadora Yi He y comunicados corporativos oficiales— garantizó la cobertura total e inmediata de todas las pérdidas no recuperadas.
El respaldo financiero se extraerá de dos pilares del balance:
1. Fondo SAFU (Secure Asset Fund for Users): El fondo de reserva de emergencia establecido por Binance en 2018 para proteger a los usuarios durante brechas de seguridad.
2. Capital y Reservas Corporativas: Liquidez corporativa y fondos propios destinados a cubrir cualquier déficit restante.
El compromiso de reembolsar a los usuarios se mantiene totalmente independiente del resultado de los esfuerzos de rastreo y recuperación legal de los 2.400 millones de dólares restantes, garantizando que ningún cliente sufra pérdidas en el saldo de su cuenta.

7.2 Restauración Operativa y Actualización de Proof of Reserves
En paralelo con la remediación de la infraestructura de red y la revisión completa de los protocolos de firma de retiros, Binance trazó los hitos para la restauración completa de la transparencia:
• Restauración de Retiros: Programada dentro de las 48 horas posteriores al evento, tras la sustitución y reforzamiento de las direcciones de retiro y contenedores de servicio.
• Publicación de Proof of Reserves (PoR): El exchange anunció que publicará un informe actualizado de Proof of Reserves tan pronto como concluya la fase de remediación.
Proof of Reserves utiliza estructuras criptográficas avanzadas (Árboles de Merkle y pruebas de conocimiento cero zk-SNARKs) para permitir a cada usuario verificar matemáticamente que sus depósitos están respaldados al 100% por reservas reales en proporción 1:1, confirmando la plena solvencia de la plataforma tras el mayor ciberataque de la historia cripto.

8. Tabla Comparativa Resumen de Medidas de Garantía y Protección

Fondo SAFU
- Tipo e instrumento: Reserva de emergencia interna (denominada en BTC/activos).
- Objetivo operativo: Cobertura directa y completa de las pérdidas de los usuarios por brechas de seguridad.
- Aplicación en el incidente Binance ($6.3B): Activado junto con reservas corporativas para cubrir el 100% de las pérdidas no recuperadas.
- Fortalezas: Garantía financiera inmediata e independiente de la recuperación de fondos.
- Límites: Reserva gestionada directamente por el exchange.

Proof of Reserves (PoR)
- Tipo e instrumento: Auditabilidad criptográfica (Árboles de Merkle y zk-SNARKs).
- Objetivo operativo: Demostrar públicamente el respaldo 1:1 de los depósitos frente a los pasivos corporativos.
- Aplicación en el incidente Binance ($6.3B): Informe actualizado programado por Binance tras la remediación para confirmar la solvencia.
- Fortalezas: Transparente y verificable matemáticamente por usuarios individuales.
- Límites: Verifica reservas ex-post; no bloquea ataques ex-ante.

Congelación On-Chain
- Tipo e instrumento: Listas negras en contratos inteligentes e intervenciones de DAO Councils.
- Objetivo operativo: Interceptar y bloquear el movimiento de tokens robados en redes blockchain.
- Aplicación en el incidente Binance ($6.3B): Aprox. $3.000 millones congelados en stablecoins y tokens (Tether, Circle, Ripple, Arbitrum Council, BitGo).
- Fortalezas: Altamente eficaz para stablecoins centralizadas y Layer 2.
- Límites: Inaplicable a criptomonedas nativas descentralizadas (BTC, ETH).

Vigilancia de Inteligencia
- Tipo e instrumento: Rastreo forense on-chain (TRM Labs, Chainalysis).
- Objetivo operativo: Monitorear wallets del atacante e interceptar intentos de salida a fiat en off-ramps.
- Aplicación en el incidente Binance ($6.3B): Identificado el grupo TraderTraitor, monitoreados $2.4B restantes, señalados swaps sospechosos.
- Fortalezas: Identifica rutas de blanqueo y apoya a las fuerzas del orden.
- Límites: No impide el control directo de las wallets por parte del atacante.

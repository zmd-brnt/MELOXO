# Pruebas

Corren contra PostgreSQL real en la base `meloxo_test`, porque los criterios críticos dependen de bloqueos reales. La base se
crea sola y se limpia entre pruebas. Jamendo se simula con `respx`.

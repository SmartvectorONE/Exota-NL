# Gebruik een officiële, lichtgewicht Nginx image
FROM nginx:alpine

# Verwijder de standaard Nginx website bestanden
RUN rm -rf /usr/share/nginx/html/*

# Kopieer alle applicatiebestanden naar de Nginx html directory
COPY . /usr/share/nginx/html/

# Kopieer je aangepaste Nginx configuratie
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Maak poort 80 beschikbaar
EXPOSE 80

# Start Nginx wanneer de container start
CMD ["nginx", "-g", "daemon off;"]

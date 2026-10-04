FROM nginx:alpine
COPY index.html signup.html styles.css site.js site-config.js /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/
COPY ["Colorful street scene of Salvador, Brazil.jpg", "/usr/share/nginx/html/"]
EXPOSE 80

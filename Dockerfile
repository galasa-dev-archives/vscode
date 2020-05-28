FROM httpd:2.4

ARG gitHash

RUN rm -v /usr/local/apache2/htdocs/*
COPY resources/httpd.conf /usr/local/apache2/conf/httpd.conf

COPY galasa-plugin-0.8.0.vsix /usr/local/apache2/htdocs/
FROM httpd:2.4

ARG gitHash

RUN rm -v /usr/local/apache2/htdocs/*
COPY resources/httpd.conf /usr/local/apache2/conf/httpd.conf

<<<<<<< HEAD
COPY galasa-plugin-*.vsix /usr/local/apache2/htdocs/
=======
COPY galasa-plugin-8.9.1.vsix /usr/local/apache2/htdocs/
>>>>>>> 70abd45382dbcbd653aaf9ae999c1ae6f6f4a0ba

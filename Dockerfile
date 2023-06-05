FROM alpine:3.18

RUN apk add --no-cache openjdk17-jre tesseract-ocr tesseract-ocr-data-eng tesseract-ocr-data-fra tini

WORKDIR /app
COPY tika-server-standard-2.8.0.jar .
COPY exe .
COPY start.sh .
RUN chmod +x /app/start.sh

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/app/start.sh"]
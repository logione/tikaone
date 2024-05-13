FROM alpine:3.18

RUN apk add --no-cache openjdk17-jre tesseract-ocr tesseract-ocr-data-eng tini

WORKDIR /app
COPY tika-server-standard-2.9.0.jar .
COPY exe .
RUN chmod +x /app/exe

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/app/exe"]
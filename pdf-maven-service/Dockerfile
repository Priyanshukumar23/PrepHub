FROM maven:3.8-eclipse-temurin-11 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn clean package

FROM eclipse-temurin:11-jre
WORKDIR /app
COPY --from=build /app/target/pdf-maven-service-1.0.0-jar-with-dependencies.jar ./app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]

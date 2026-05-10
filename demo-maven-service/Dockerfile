FROM maven:3.8-eclipse-temurin-11 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package

FROM eclipse-temurin:11-jre
WORKDIR /app
COPY --from=build /app/target/demo-maven-service-1.0.0.jar ./app.jar
CMD ["java", "-jar", "app.jar"]

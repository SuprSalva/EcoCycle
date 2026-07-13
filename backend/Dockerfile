# EcoCycle .NET Backend - imagen de producción (multi-stage)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY Back/Back.csproj Back/
RUN dotnet restore Back/Back.csproj

COPY Back/ Back/
RUN dotnet publish Back/Back.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

# La clave de Firebase NO va dentro de la imagen: se monta en tiempo de ejecución
# (ver docker-compose.prod.yml)

ENV ASPNETCORE_URLS=http://0.0.0.0:5000
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 5000

ENTRYPOINT ["dotnet", "Back.dll"]

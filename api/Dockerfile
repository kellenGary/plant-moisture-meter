# Build stage
FROM mcr.microsoft.com/dotnet/sdk:latest AS build
WORKDIR /src

# Copy project file and restore
COPY PlantMonitorApi.csproj .
RUN dotnet restore

# Copy source and build
COPY . .
RUN dotnet publish -c Release -o /app/publish

# Runtime stage  
FROM mcr.microsoft.com/dotnet/aspnet:latest
WORKDIR /app

# Copy published app
COPY --from=build /app/publish .

# Expose port
EXPOSE 5050

# Run the app
ENTRYPOINT ["dotnet", "PlantMonitorApi.dll"]

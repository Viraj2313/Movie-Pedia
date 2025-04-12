# Use the official .NET SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy the project file and restore dependencies
COPY MovieApiApp/*.csproj ./MovieApiApp/
WORKDIR /app/MovieApiApp
RUN dotnet restore

# Copy the entire API project and build it
COPY MovieApiApp/. .
RUN dotnet publish -c Release -o /out

# Use a lightweight runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /out .

# Expose the port Render will use
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

# Run the application
CMD ["dotnet", "MovieApiApp.dll"]

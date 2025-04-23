FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the solution/project files
COPY MovieApiApp/*.csproj ./MovieApiApp/
RUN dotnet restore MovieApiApp/MovieApiApp.csproj

# Copy the rest of the app
COPY MovieApiApp/. ./MovieApiApp/
WORKDIR /src/MovieApiApp
RUN dotnet build -c Release -o /app/build
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "MovieApiApp.dll"]

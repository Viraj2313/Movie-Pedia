FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src

COPY MovieApiApp/MovieApiApp.csproj MovieApiApp/
RUN dotnet restore MovieApiApp/MovieApiApp.csproj

COPY MovieApiApp/ MovieApiApp/
WORKDIR /src/MovieApiApp

RUN dotnet build MovieApiApp.csproj -c Release -o /app/build
RUN dotnet publish MovieApiApp.csproj -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "MovieApiApp.dll"]

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY MovieApiApp.csproj .
RUN dotnet restore MovieApiApp.csproj

COPY . .
RUN dotnet build MovieApiApp.csproj -c Release -o /app/build
RUN dotnet publish MovieApiApp.csproj -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "MovieApiApp.dll"]

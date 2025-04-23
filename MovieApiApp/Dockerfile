FROM --platform=$TARGETPLATFORM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["MovieApiApp/MovieApiApp.csproj", "MovieApiApp/"]
RUN dotnet restore "MovieApiApp/MovieApiApp.csproj"

COPY MovieApiApp/ MovieApiApp/
WORKDIR "/src/MovieApiApp"
RUN dotnet build "MovieApiApp.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "MovieApiApp.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "MovieApiApp.dll"]

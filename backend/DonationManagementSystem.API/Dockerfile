FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY backend/DonationManagementSystem.API/DonationManagementSystem.API.csproj backend/DonationManagementSystem.API/
RUN dotnet restore backend/DonationManagementSystem.API/DonationManagementSystem.API.csproj

COPY backend/DonationManagementSystem.API/ backend/DonationManagementSystem.API/
WORKDIR /src/backend/DonationManagementSystem.API
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "DonationManagementSystem.API.dll"]

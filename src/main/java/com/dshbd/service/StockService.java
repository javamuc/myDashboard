package com.dshbd.service;

import com.dshbd.config.ApplicationProperties;
import com.dshbd.service.dto.StockDTO;
import com.dshbd.service.dto.StockSymbolDTO;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class StockService {

    private final Logger log = LoggerFactory.getLogger(StockService.class);
    private final RestTemplate restTemplate;

    @Value("${application.finnhub.api-key}")
    private String finnhubApiKey;

    private final Map<String, StockDTO> savedStocks = new ConcurrentHashMap<>();

    public StockService(RestTemplate restTemplate, ApplicationProperties properties) {
        this.restTemplate = restTemplate;
        this.finnhubApiKey = properties.getFinnhub().getApiKey();
    }

    public List<StockDTO> searchStocks(String query) {
        log.info("Finnhub API key: {}", finnhubApiKey);
        try {
            String url = UriComponentsBuilder.fromHttpUrl("https://finnhub.io/api/v1/search")
                .queryParam("q", query)
                .queryParam("token", finnhubApiKey)
                .build()
                .toUriString();

            FinnhubSearchResponse response = restTemplate.getForObject(url, FinnhubSearchResponse.class);

            if (response != null && response.getResult() != null) {
                List<StockDTO> results = new ArrayList<>();
                for (FinnhubSearchResult result : response.getResult()) {
                    results.add(new StockDTO(result.getSymbol(), result.getDescription(), result.getType()));
                }
                return results;
            }
        } catch (Exception e) {
            log.error("Error searching stocks: {}", e.getMessage());
        }
        return Collections.emptyList();
    }

    public List<StockDTO> getSavedStocks() {
        return new ArrayList<>(savedStocks.values());
    }

    public void saveStock(StockDTO stockDTO) {
        savedStocks.put(stockDTO.getSymbol(), stockDTO);
    }

    public void deleteStock(String symbol) {
        savedStocks.remove(symbol);
    }

    public List<StockSymbolDTO> getExchangeSymbols(String exchange) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl("https://finnhub.io/api/v1/stock/symbol")
                .queryParam("exchange", exchange)
                .queryParam("token", finnhubApiKey)
                .build()
                .toUriString();

            ResponseEntity<StockSymbolDTO[]> response = restTemplate.getForEntity(url, StockSymbolDTO[].class);
            return response.getBody() != null ? Arrays.asList(response.getBody()) : Collections.emptyList();
        } catch (Exception e) {
            log.error("Error fetching exchange symbols: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    private static class FinnhubSearchResponse {

        private List<FinnhubSearchResult> result;

        public List<FinnhubSearchResult> getResult() {
            return result;
        }

        public void setResult(List<FinnhubSearchResult> result) {
            this.result = result;
        }
    }

    private static class FinnhubSearchResult {

        private String description;
        private String displaySymbol;
        private String symbol;
        private String type;

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getDisplaySymbol() {
            return displaySymbol;
        }

        public void setDisplaySymbol(String displaySymbol) {
            this.displaySymbol = displaySymbol;
        }

        public String getSymbol() {
            return symbol;
        }

        public void setSymbol(String symbol) {
            this.symbol = symbol;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }
    }
}

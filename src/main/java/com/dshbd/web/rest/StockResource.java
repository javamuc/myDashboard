package com.dshbd.web.rest;

import com.dshbd.service.StockService;
import com.dshbd.service.dto.StockDTO;
import com.dshbd.service.dto.StockSymbolDTO;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stocks")
public class StockResource {

    private final Logger log = LoggerFactory.getLogger(StockResource.class);
    private final StockService stockService;

    public StockResource(StockService stockService) {
        this.stockService = stockService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<StockDTO>> searchStocks(@RequestParam String query) {
        log.debug("REST request to search stocks with query: {}", query);
        return ResponseEntity.ok(stockService.searchStocks(query));
    }

    @GetMapping("/saved")
    public ResponseEntity<List<StockDTO>> getSavedStocks() {
        log.debug("REST request to get saved stocks");
        return ResponseEntity.ok(stockService.getSavedStocks());
    }

    @PostMapping("/saved")
    public ResponseEntity<Void> saveStock(@RequestBody StockDTO stockDTO) {
        log.debug("REST request to save stock: {}", stockDTO);
        stockService.saveStock(stockDTO);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/saved/{symbol}")
    public ResponseEntity<Void> deleteStock(@PathVariable String symbol) {
        log.debug("REST request to delete stock: {}", symbol);
        stockService.deleteStock(symbol);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/symbols/{exchange}")
    public ResponseEntity<List<StockSymbolDTO>> getExchangeSymbols(@PathVariable String exchange) {
        log.debug("REST request to get symbols for exchange: {}", exchange);
        return ResponseEntity.ok(stockService.getExchangeSymbols(exchange));
    }
}

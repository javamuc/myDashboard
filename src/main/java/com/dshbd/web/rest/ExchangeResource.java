package com.dshbd.web.rest;

import com.dshbd.domain.Exchange;
import com.dshbd.repository.ExchangeVM;
import com.dshbd.service.ExchangeService;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ExchangeResource {

    private final Logger log = LoggerFactory.getLogger(ExchangeResource.class);
    private final ExchangeService exchangeService;

    public ExchangeResource(ExchangeService exchangeService) {
        this.exchangeService = exchangeService;
    }

    @GetMapping("/exchanges")
    public List<ExchangeVM> getAllExchanges() {
        log.debug("REST request to get all Exchanges");
        return exchangeService.findAll();
    }

    @GetMapping("/exchanges/{code}")
    public ResponseEntity<Exchange> getExchange(@PathVariable String code) {
        log.debug("REST request to get Exchange : {}", code);
        Optional<Exchange> exchange = exchangeService.findOne(code);
        return exchange.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}

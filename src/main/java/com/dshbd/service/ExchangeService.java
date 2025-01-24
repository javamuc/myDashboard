package com.dshbd.service;

import com.dshbd.domain.Exchange;
import com.dshbd.repository.ExchangeRepository;
import com.dshbd.repository.ExchangeVM;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ExchangeService {

    private final Logger log = LoggerFactory.getLogger(ExchangeService.class);
    private final ExchangeRepository exchangeRepository;

    public ExchangeService(ExchangeRepository exchangeRepository) {
        this.exchangeRepository = exchangeRepository;
    }

    @Transactional(readOnly = true)
    public List<ExchangeVM> findAll() {
        log.debug("Request to get all Exchanges");
        return exchangeRepository.findAllExchangesVM();
    }

    @Transactional(readOnly = true)
    public Optional<Exchange> findOne(String code) {
        log.debug("Request to get Exchange : {}", code);
        return exchangeRepository.findById(code);
    }
}

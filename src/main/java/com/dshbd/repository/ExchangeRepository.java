package com.dshbd.repository;

import com.dshbd.domain.Exchange;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExchangeRepository extends JpaRepository<Exchange, String> {
    List<ExchangeVM> findAll();
}

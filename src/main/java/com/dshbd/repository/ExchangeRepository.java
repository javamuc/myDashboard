package com.dshbd.repository;

import com.dshbd.domain.Exchange;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ExchangeRepository extends JpaRepository<Exchange, String> {
    @Query(
        """
        SELECT
         new com.dshbd.repository.ExchangeVM(e.code, e.name, e.countryName)
        FROM
         Exchange e
        WHERE e.enabled = true
         """
    )
    List<ExchangeVM> findAllExchangesVM();
}

package com.dshbd.web.rest;

import com.dshbd.service.ImportService;
import com.dshbd.service.dto.ImportDataDTO;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class DataResource {

    private final Logger log = LoggerFactory.getLogger(DataResource.class);
    private final ImportService importService;

    public DataResource(ImportService importService) {
        this.importService = importService;
    }

    @PostMapping("/data/import")
    public ResponseEntity<Void> importData(@Valid @RequestBody ImportDataDTO importData) {
        log.debug("REST request to import data");
        importService.importData(importData);
        return ResponseEntity.ok().build();
    }
}

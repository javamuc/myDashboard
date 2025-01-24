package com.dshbd.service.dto;

import java.io.Serializable;
import java.util.Objects;

public class StockDTO implements Serializable {

    private String symbol;
    private String description;
    private String type;

    public StockDTO() {}

    public StockDTO(String symbol, String description, String type) {
        this.symbol = symbol;
        this.description = description;
        this.type = type;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        StockDTO stockDTO = (StockDTO) o;
        return Objects.equals(symbol, stockDTO.symbol);
    }

    @Override
    public int hashCode() {
        return Objects.hash(symbol);
    }

    @Override
    public String toString() {
        return "StockDTO{" + "symbol='" + symbol + '\'' + ", description='" + description + '\'' + ", type='" + type + '\'' + '}';
    }
}

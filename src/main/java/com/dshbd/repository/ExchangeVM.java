package com.dshbd.repository;

public class ExchangeVM {

    private String code;
    private String name;
    private String countryName;

    public ExchangeVM(String code, String name, String countryName) {
        this.code = code;
        this.name = name;
        this.countryName = countryName;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public String getCountryName() {
        return countryName;
    }
}

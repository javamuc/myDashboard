package com.dshbd.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "exchange")
public class Exchange implements Serializable {

    @Id
    @Column(name = "code", length = 10)
    private String code;

    @Column(name = "name")
    private String name;

    @Column(name = "mic", length = 10)
    private String mic;

    @Column(name = "timezone")
    private String timezone;

    @Column(name = "pre_market")
    private String preMarket;

    @Column(name = "hour")
    private String hour;

    @Column(name = "post_market")
    private String postMarket;

    @Column(name = "close_date")
    private String closeDate;

    @Column(name = "country", length = 2)
    private String country;

    @Column(name = "country_name")
    private String countryName;

    @Column(name = "source")
    private String source;

    // Getters and Setters
    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMic() {
        return mic;
    }

    public void setMic(String mic) {
        this.mic = mic;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public String getPreMarket() {
        return preMarket;
    }

    public void setPreMarket(String preMarket) {
        this.preMarket = preMarket;
    }

    public String getHour() {
        return hour;
    }

    public void setHour(String hour) {
        this.hour = hour;
    }

    public String getPostMarket() {
        return postMarket;
    }

    public void setPostMarket(String postMarket) {
        this.postMarket = postMarket;
    }

    public String getCloseDate() {
        return closeDate;
    }

    public void setCloseDate(String closeDate) {
        this.closeDate = closeDate;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getCountryName() {
        return countryName;
    }

    public void setCountryName(String countryName) {
        this.countryName = countryName;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Exchange)) return false;
        Exchange exchange = (Exchange) o;
        return Objects.equals(getCode(), exchange.getCode());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getCode());
    }

    @Override
    public String toString() {
        return (
            "Exchange{" +
            "code='" +
            code +
            '\'' +
            ", name='" +
            name +
            '\'' +
            ", mic='" +
            mic +
            '\'' +
            ", timezone='" +
            timezone +
            '\'' +
            '}'
        );
    }
}

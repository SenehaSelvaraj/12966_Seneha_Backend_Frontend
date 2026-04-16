package com.itemservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
 
@Entity
@Table(name = "items")
public class Item {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    private String itemName;
    private String category;
    private String description;
    private String location;
 
    
    @Enumerated(EnumType.STRING)
    private ReportType reportType;
 
    @Enumerated(EnumType.STRING)
    private Status status;
    private Long reportedBy;       
    private Long matchedItemId;   
    private String collectTime;    
    private String collectMessage; 
    private boolean urgent=false;
    private String urgentReason;
    private boolean acknowledged=false;
 
    @CreationTimestamp
    private LocalDateTime createdAt;
 
    public enum ReportType { FOUND, LOST }
 
    public enum Status {
        LOST,      
        FOUND,      
        SEARCHING,  
        MATCHED,    
        RETURNED, 
        CLOSED      
    }

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getItemName() {
		return itemName;
	}

	public void setItemName(String itemName) {
		this.itemName = itemName;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	public ReportType getReportType() {
		return reportType;
	}

	public void setReportType(ReportType reportType) {
		this.reportType = reportType;
	}

	public Status getStatus() {
		return status;
	}

	public void setStatus(Status status) {
		this.status = status;
	}

	public Long getReportedBy() {
		return reportedBy;
	}

	public void setReportedBy(Long reportedBy) {
		this.reportedBy = reportedBy;
	}

	public Long getMatchedItemId() {
		return matchedItemId;
	}

	public void setMatchedItemId(Long matchedItemId) {
		this.matchedItemId = matchedItemId;
	}

	public String getCollectTime() {
		return collectTime;
	}

	public void setCollectTime(String collectTime) {
		this.collectTime = collectTime;
	}

	public String getCollectMessage() {
		return collectMessage;
	}

	public void setCollectMessage(String collectMessage) {
		this.collectMessage = collectMessage;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public boolean isUrgent() {
		return urgent;
	}

	public void setUrgent(boolean urgent) {
		this.urgent = urgent;
	}

	public String getUrgentReason() {
		return urgentReason;
	}

	public void setUrgentReason(String urgentReason) {
		this.urgentReason = urgentReason;
	}

	public boolean isAcknowledged() {
		return acknowledged;
	}

	public void setAcknowledged(boolean acknowledged) {
		this.acknowledged = acknowledged;
	}
    
    
}
 
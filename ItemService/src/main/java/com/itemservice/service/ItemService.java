package com.itemservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.itemservice.entity.Item;
import com.itemservice.repository.ItemRepository;
import java.util.List;
 
@Service
public class ItemService {
 
    @Autowired
    private ItemRepository itemRepository;
 
    
    public Item reportFound(Item item) {
        item.setReportType(Item.ReportType.FOUND);
        item.setStatus(Item.Status.FOUND);
        return itemRepository.save(item);
    }
 
   
    public Item reportLost(Item item) {
        item.setReportType(Item.ReportType.LOST);
        item.setStatus(Item.Status.LOST);
        return itemRepository.save(item);
    }
 
    
    public Item getItemById(Long id) {
        return itemRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Item not found with id: " + id));
    }
 
    
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }
 
    
    public List<Item> getMyItems(Long userId) {
        return itemRepository.findByReportedBy(userId);
    }
 
   
    public List<Item> getSearchingItems() {
        return itemRepository.findByReportTypeAndStatus(
            Item.ReportType.LOST,
            Item.Status.SEARCHING
        );
    }
 
    
    public Item matchItems(Long lostItemId, Long foundItemId,
                           String collectTime, String collectMessage) {
        Item lostItem  = getItemById(lostItemId);
        Item foundItem = getItemById(foundItemId);
 
        lostItem.setMatchedItemId(foundItemId);
        lostItem.setStatus(Item.Status.MATCHED);
        lostItem.setCollectTime(collectTime);
        lostItem.setCollectMessage(collectMessage);
 
        foundItem.setMatchedItemId(lostItemId);
        foundItem.setStatus(Item.Status.MATCHED);
 
        itemRepository.save(foundItem);
        return itemRepository.save(lostItem);
    }
 
    
    public Item publishSearching(Long itemId) {
        Item item = getItemById(itemId);
        item.setStatus(Item.Status.SEARCHING);
        return itemRepository.save(item);
    }
 
    
    public Item claimFound(Long searchingItemId, Long foundByUserId, String description) {
        Item searchingItem = getItemById(searchingItemId);
 
        Item foundReport = new Item();
        foundReport.setItemName(searchingItem.getItemName());
        foundReport.setCategory(searchingItem.getCategory());
        foundReport.setDescription(description);
        foundReport.setReportType(Item.ReportType.FOUND);
        foundReport.setStatus(Item.Status.FOUND);
        foundReport.setReportedBy(foundByUserId);
        foundReport.setMatchedItemId(searchingItemId);
        return itemRepository.save(foundReport);
    }
 
    
    public Item updateStatus(Long id, String status,
                             String collectTime, String collectMessage) {
        Item item = getItemById(id);
        item.setStatus(Item.Status.valueOf(status));
        if (collectTime    != null && !collectTime.isEmpty())    item.setCollectTime(collectTime);
        if (collectMessage != null && !collectMessage.isEmpty()) item.setCollectMessage(collectMessage);
        return itemRepository.save(item);
    }
 
    
    public long countByUser(Long userId) {
        return itemRepository.countByReportedBy(userId);
    }
}
 
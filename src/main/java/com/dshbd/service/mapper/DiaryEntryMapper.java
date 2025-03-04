package com.dshbd.service.mapper;

import com.dshbd.domain.DiaryEntry;
import com.dshbd.service.dto.DiaryEntryDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DiaryEntryMapper {
    DiaryEntryDTO toDto(DiaryEntry diaryEntry);
    DiaryEntry toEntity(DiaryEntryDTO diaryEntryDTO);
}

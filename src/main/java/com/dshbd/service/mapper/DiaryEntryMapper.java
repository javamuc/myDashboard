package com.dshbd.service.mapper;

import com.dshbd.domain.DiaryEntry;
import com.dshbd.service.dto.DiaryEntryDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = { DiaryTagMapper.class })
public interface DiaryEntryMapper {
    DiaryEntryDTO toDto(DiaryEntry diaryEntry);
    DiaryEntry toEntity(DiaryEntryDTO diaryEntryDTO);
}

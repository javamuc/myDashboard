package com.dshbd.service.mapper;

import com.dshbd.domain.DiaryTag;
import com.dshbd.service.dto.DiaryTagDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DiaryTagMapper {
    DiaryTagDTO toDto(DiaryTag diaryTag);
    DiaryTag toEntity(DiaryTagDTO diaryTagDTO);
}

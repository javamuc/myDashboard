package com.dshbd.service.mapper;

import com.dshbd.domain.Note;
import com.dshbd.service.dto.NoteDTO;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = { UserMapper.class })
public interface NoteMapper {
    NoteDTO toDto(Note note);

    @Mapping(target = "userId", ignore = true)
    Note toEntity(NoteDTO noteDTO);

    @Mapping(target = "userId", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void partialUpdate(@MappingTarget Note entity, NoteDTO dto);
}

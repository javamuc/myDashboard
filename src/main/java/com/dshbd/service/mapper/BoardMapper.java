package com.dshbd.service.mapper;

import com.dshbd.domain.Board;
import com.dshbd.service.dto.BoardDTO;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = {})
public interface BoardMapper {
    BoardDTO toDto(Board board);

    Board toEntity(BoardDTO boardDTO);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void partialUpdate(@MappingTarget Board entity, BoardDTO dto);
}
